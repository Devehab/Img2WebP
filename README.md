# Image to WebP Converter - Chrome Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-v1.0-blue)](https://chrome.google.com/webstore)
[![GitHub issues](https://img.shields.io/github/issues/Devehab/Img2WebP)](https://github.com/Devehab/Img2WebP/issues)
[![GitHub stars](https://img.shields.io/github/stars/Devehab/Img2WebP)](https://github.com/Devehab/Img2WebP/stargazers)
[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-yellow.svg)](https://www.javascript.com)

<div align="center">
  <img src="icons/icon128.png" alt="Img2WebP Logo" width="128" height="128">
  <p>A powerful Chrome extension that converts images to WebP format with quality and size control options. Perfect for optimizing images for web use.</p>
</div>

## 🚀 Features

- Convert multiple images to WebP format
- Drag and drop support for files and folders
- Adjustable image quality (0-100%)
- Multiple size options (16px to 8K)
- Automatic ZIP creation for multiple files
- Live preview of images
- Progress indication
- Modern, user-friendly interface

## ⚡ Quick Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## 🎯 Usage

1. Click the extension icon in Chrome
2. Select images by:
   - Clicking the upload button
   - Dragging and dropping files
   - Selecting a folder
3. Adjust quality and size settings
4. Click "Convert to WebP" button
5. Files will be downloaded automatically

## 🛠️ Development

### Project Structure
```
/Img2WebP
├── manifest.json
├── index.html
├── converter.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

### Building for Production

1. Minify JavaScript and CSS
2. Remove development comments
3. Optimize images
4. Create ZIP file
5. Test packed extension

## 📝 Chrome Web Store Publishing Requirements

### Required Items

1. **Extension ZIP File**
   - Maximum size: 10MB
   - All files must be necessary for the extension
   - Minify JavaScript and CSS files
   - Remove unnecessary files

2. **Store Listing**
   - Extension name (50 characters max)
   - Description (132 characters max for short, 1,680 for detailed)
   - Category selection
   - Language selection
   - Screenshots (up to 5)
   - Store icon (128x128 PNG)
   - Promotional images (optional):
     - Small: 440x280 PNG
     - Large: 920x680 PNG
     - Marquee: 1400x560 PNG

3. **Privacy**
   - Privacy policy URL if collecting user data
   - Permissions justification
   - Data usage explanation

### Technical Requirements

1. **Manifest.json**
   - Must be properly formatted
   - Version number
   - Clear description
   - Appropriate permissions
   - Valid icons
   - Content security policy

2. **Security**
   - No external JavaScript
   - Secure content loading
   - No eval() or similar unsafe functions
   - HTTPS for external resources

3. **Performance**
   - Fast load time
   - Efficient resource usage
   - No memory leaks

### Content Policy Requirements

1. **Quality Guidelines**
   - Single purpose design
   - Clear functionality
   - No misleading information
   - Accurate description and images

2. **User Data Privacy**
   - Clear data collection disclosure
   - Secure data handling
   - User consent for data collection
   - GDPR compliance if applicable

3. **Prohibited Content**
   - No malware or harmful code
   - No hate speech or adult content
   - No intellectual property violations
   - No cryptocurrency mining

### Store Listing Checklist

- [ ] Extension name
- [ ] Short description
- [ ] Detailed description
- [ ] At least 1 screenshot
- [ ] 128x128 icon
- [ ] Selected category
- [ ] Selected language(s)
- [ ] Privacy policy (if needed)
- [ ] Promotional images (optional)

### Technical Checklist

- [ ] Valid manifest.json
- [ ] All required icons
- [ ] Working extension files
- [ ] Proper permissions
- [ ] Security compliance
- [ ] Performance optimization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

For support, please [open an issue](https://github.com/Devehab/Img2WebP/issues) in the GitHub repository or contact the developer.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🌟 Show your support

Give a ⭐️ if this project helped you!

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Devehab">Devehab</a></sub>
</div>
