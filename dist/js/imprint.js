/**
 * Imprint 1.0.0
 * Images File Upload widget with multiple file selection, drag&amp;drop support, progress bar, validation filter and preview images for zepto, usually used in webapp with ios and android. that only supports standard HTML5.
 * 
 * https://github.com/l-zhi/LZFile#readme
 * 
 * Copyright 2017, l-zhi
 * 
 * Licensed under ISC
 * 
 * Released on: November 27, 2017
 */
(function(window, document, undefined) {
  var Imprint = {}
  Imprint.version = '0.1'
  var getOffsetColor = function(color, offset) {
    var clone = color.slice(0)
    var avg = (clone[0] + clone[1] + clone[2]) / 3
    if (avg > 155) {
      clone[0] = clone[0] - offset >= 0 ? clone[0] - offset : 0
      clone[1] = clone[1] - offset >= 0 ? clone[1] - offset : 0
      clone[2] = clone[2] - offset >= 0 ? clone[2] - offset : 0
    } else {
      clone[0] = clone[0] + offset >= 0 ? clone[0] + offset : 0
      clone[1] = clone[1] + offset >= 0 ? clone[1] + offset : 0
      clone[2] = clone[2] + offset >= 0 ? clone[2] + offset : 0
    }
    return clone
  }
  var setBlocks = function(imgData, pos, width, height) {
    var color = getColor(imgData, pos)
    var data = imgData.data
    var top = pos - width
    var left = pos - 1
    var right = pos + 1
    var bottom = pos + width
    setColor(imgData, pos, getOffsetColor(color, 10))
    if (top >= 0) {
      setColor(imgData, top, color)
    }
    if (bottom <= width * height - 1) {
      setColor(imgData, bottom, color)
    }
    if (left >= 0 && pos % width !== 0) {
      setColor(imgData, left, color)
    }
    if (right <= width * height - 1 && right % width !== 0) {
      setColor(imgData, right, color)
    }
  }
  var checkBlocks = function(imgData, pos, width, height) {
    var data = imgData.data
    var top = pos - width
    var left = pos - 1
    var right = pos + 1
    var bottom = pos + width
    var oColor = getColor(imgData, pos)
    var cColors = []
    if (top >= 0) {
      cColors.push(getColor(imgData, top))
    }
    if (bottom <= width * height - 1) {
      cColors.push(getColor(imgData, bottom))
    }
    if (left >= 0 && pos % width !== 0) {
      cColors.push(getColor(imgData, left))
    }
    if (right <= width * height - 1 && right % width !== 0) {
      cColors.push(getColor(imgData, right))
    }
    var newColor = [0, 0, 0]
    var len = cColors.length
    for (var i = 0; i < len; i++) {
      newColor[0] += cColors[i][0]
      newColor[1] += cColors[i][1]
      newColor[2] += cColors[i][2]
    }
    newColor[0] = Math.abs(newColor[0] / len - oColor[0])
    newColor[1] = Math.abs(newColor[1] / len - oColor[1])
    newColor[2] = Math.abs(newColor[2] / len - oColor[2])
    var ok = 0
    newColor[0] > 5 && ++ok
    newColor[1] > 5 && ++ok
    newColor[2] > 5 && ++ok
    var flag = false
    if (ok > 1) {
      flag = true
    }
    return flag
  }
  var setColor = function(imgData, pos, color) {
    imgData.data[pos * 4] = color[0]
    imgData.data[pos * 4 + 1] = color[1]
    imgData.data[pos * 4 + 2] = color[2]
  }
  var getColor = function(imgData, pos) {
    var data = imgData.data
    return [data[pos * 4], data[pos * 4 + 1], data[pos * 4 + 2]]
  }
  var hashStr = function(str) {
    var hash = 5381,
      i = str.length

    while (i) {
      hash = (hash * 33) ^ str.charCodeAt(--i)
    }
    return hash >>> 0
  }
  var matrix = function(sequ, num, width, height) {
    if (sequ > 15) {
      console.warn('error sequ')
      return false
    }
    var rangW = Math.floor(width / 4)
    var rangH = Math.floor(height / 4)
    if (num >= rangW * rangH) {
      console.warn('error')
      return false
    }
    var y = Math.floor(sequ / 4)
    var x = sequ % 4
    var nY = Math.floor(num / rangW)
    var nX = num % rangW
    var result = y * width * rangH + x * rangW + nY * width + nX
    if (result >= width * height) {
      console.warn('error')
      return false
    }
    return result
  }
  var stringToCoord = function(str, width, height) {
    var arr = [0, width - 1, width * (height - 1), width * height - 1]
    var hash = '' + hashStr(str)
    var len = ('' + hash).length
    var i = 0
    while (len - i) {
      arr.push(matrix(i, +hash[i], width, height))
      i++
    }
    return arr
  }
  var convert = function(imgData, pass, width, height) {
    var num = width * height / 2 - 1
    var end = width * height - 1
    var tmp = 0
    var str = pass
    var coord = stringToCoord(str, width, height)
    for (var i = 0; i < coord.length; i++) {
      setBlocks(imgData, coord[i], width, height)
    }
  }
  /**
   *
   * @param {Image Dom} img 图片DOM
   * @param {String} pass 密码字符串
   */
  var encode = function(img, pass, options) {
    options = options || {}
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')
    canvas.style.display = 'none'
    canvas.width = options.width || img.width
    canvas.height = options.height || img.height
    document.getElementsByTagName('body')[0].appendChild(canvas)
    if (options.height && options.width) {
      ctx.drawImage(img, 0, 0, options.width, options.height)
    } else {
      ctx.drawImage(img, 0, 0)
    }
    var width = canvas.width
    var height = canvas.height
    var imageData = ctx.getImageData(0, 0, width, height)
    convert(imageData, pass, width, height)
    ctx.putImageData(imageData, 0, 0)
    var blob = canvas.toDataURL('image/jpeg', 1.0)
    return blob
  }
  /**
   *
   * @param {Image Dom} img 图片DOM
   * @param {String} pass 解密字符串
   */
  var decode = function(img, pass, options) {
    options = options || {}
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')
    canvas.style.display = 'none'
    canvas.width = options.width || img.width
    canvas.height = options.height || img.height
    if (options.height && options.width) {
      ctx.drawImage(img, 0, 0, options.width, options.height)
    } else {
      ctx.drawImage(img, 0, 0)
    }
    var width = canvas.width
    var height = canvas.height
    var imgData = ctx.getImageData(0, 0, width, height)
    var str = pass
    var coord = stringToCoord(str, width, height)
    var right = 0
    var wrong = 0
    for (var i = 0; i < coord.length; i++) {
      if (checkBlocks(imgData, coord[i], width, height)) {
        ++right
      } else {
        ++wrong
      }
    }
    if (wrong < 2) {
      return true
    } else {
      return false
    }
  }

  Imprint = {
    encode: encode,
    decode: decode
  }

  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = Imprint
  } else if (typeof define === 'function' && (define.amd || define.cmd)) {
    define(function() {
      return Imprint
    })
  } else {
    window.Imprint = Imprint
  }
}(window, document))
