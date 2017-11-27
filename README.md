# Imprint

Images encode and decode with password.

```html
<script src="dist/js/imprint.js"></script>
```

HTML code ：

```javascript
/**
 * @param {Image Dom} img 图片DOM
 * @param {String} pass 密码字符串
 */
window.Imprint.encode(img, 'password')

/**
 * @param {Image Dom} img 图片DOM
 * @param {String} pass 解密字符串
 */
window.Imprint.decode(img, 'password')
```

#### Example

![Demo](https://raw.githubusercontent.com/l-zhi/LZFile/gh-pages/code.png)

## License

All code licensed under the
[MIT License](http://www.opensource.org/licenses/mit-license.php).
