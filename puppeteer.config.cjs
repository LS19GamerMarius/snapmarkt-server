const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
  downloadHost: 'https://storage.googleapis.com/chrome-for-testing-public'
}; 