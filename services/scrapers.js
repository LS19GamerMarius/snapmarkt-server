const puppeteer = require('puppeteer');

class SupermarketScraper {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async setupPage() {
    const page = await this.browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setRequestInterception(true);
    
    page.on('request', (request) => {
      if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    return page;
  }

  async scrapeRewe(query) {
    const page = await this.setupPage();
    try {
      await page.goto(`https://shop.rewe.de/search/${encodeURIComponent(query)}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      // Accept cookies if present
      try {
        await page.waitForSelector('#uc-btn-accept-banner', { timeout: 5000 });
        await page.click('#uc-btn-accept-banner');
      } catch (e) {
        // Cookie banner might not be present
      }

      // Wait for products to load
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

      // Extract product information
      const products = await page.evaluate(() => {
        const items = document.querySelectorAll('[data-testid="product-card"]');
        return Array.from(items).map(item => ({
          name: item.querySelector('[data-testid="product-title"]')?.textContent.trim(),
          price: parseFloat(
            item.querySelector('[data-testid="product-price"]')
              ?.textContent.replace('€', '')
              .replace(',', '.')
              .trim()
          ),
          image: item.querySelector('img')?.src,
          unit: item.querySelector('[data-testid="product-grammage"]')?.textContent.trim()
        })).filter(item => item.name && item.price);
      });

      return products;
    } catch (error) {
      console.error('Error scraping REWE:', error);
      return [];
    } finally {
      await page.close();
    }
  }

  async scrapeLidl(query) {
    const page = await this.setupPage();
    try {
      await page.goto(`https://www.lidl.de/suche?query=${encodeURIComponent(query)}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Accept cookies if present
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 5000 });
        await page.click('#onetrust-accept-btn-handler');
      } catch (e) {
        // Cookie banner might not be present
      }

      // Wait for products to load
      await page.waitForSelector('.product__grid-card', { timeout: 10000 });

      // Extract product information
      const products = await page.evaluate(() => {
        const items = document.querySelectorAll('.product__grid-card');
        return Array.from(items).map(item => ({
          name: item.querySelector('.product__title')?.textContent.trim(),
          price: parseFloat(
            item.querySelector('.price__amount')
              ?.textContent.replace('€', '')
              .replace(',', '.')
              .trim()
          ),
          image: item.querySelector('.product__image img')?.src,
          unit: item.querySelector('.price__unit')?.textContent.trim()
        })).filter(item => item.name && item.price);
      });

      return products;
    } catch (error) {
      console.error('Error scraping Lidl:', error);
      return [];
    } finally {
      await page.close();
    }
  }

  async scrapeAldi(query) {
    const page = await this.setupPage();
    try {
      await page.goto(`https://www.aldi-sued.de/de/produkte/produktsuche.html?search=${encodeURIComponent(query)}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Accept cookies if present
      try {
        await page.waitForSelector('.js-cookie-accept-all', { timeout: 5000 });
        await page.click('.js-cookie-accept-all');
      } catch (e) {
        // Cookie banner might not be present
      }

      // Wait for products to load
      await page.waitForSelector('.product-tile', { timeout: 10000 });

      // Extract product information
      const products = await page.evaluate(() => {
        const items = document.querySelectorAll('.product-tile');
        return Array.from(items).map(item => ({
          name: item.querySelector('.product-tile__title')?.textContent.trim(),
          price: parseFloat(
            item.querySelector('.price__main')
              ?.textContent.replace('€', '')
              .replace(',', '.')
              .trim()
          ),
          image: item.querySelector('.product-tile__image img')?.src,
          unit: item.querySelector('.price__basic')?.textContent.trim()
        })).filter(item => item.name && item.price);
      });

      return products;
    } catch (error) {
      console.error('Error scraping Aldi:', error);
      return [];
    } finally {
      await page.close();
    }
  }

  async scrapePenny(query) {
    const page = await this.setupPage();
    try {
      await page.goto(`https://www.penny.de/suche?q=${encodeURIComponent(query)}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Accept cookies if present
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 5000 });
        await page.click('#onetrust-accept-btn-handler');
      } catch (e) {
        // Cookie banner might not be present
      }

      // Wait for products to load
      await page.waitForSelector('.penny-product-tile', { timeout: 10000 });

      // Extract product information
      const products = await page.evaluate(() => {
        const items = document.querySelectorAll('.penny-product-tile');
        return Array.from(items).map(item => ({
          name: item.querySelector('.penny-product-tile__title')?.textContent.trim(),
          price: parseFloat(
            item.querySelector('.penny-product-tile__price-main')
              ?.textContent.replace('€', '')
              .replace(',', '.')
              .trim()
          ),
          image: item.querySelector('.penny-product-tile__image img')?.src,
          unit: item.querySelector('.penny-product-tile__price-basic')?.textContent.trim()
        })).filter(item => item.name && item.price);
      });

      return products;
    } catch (error) {
      console.error('Error scraping Penny:', error);
      return [];
    } finally {
      await page.close();
    }
  }

  async searchAllSupermarkets(query) {
    if (!this.browser) {
      await this.initialize();
    }

    const results = await Promise.allSettled([
      this.scrapeRewe(query),
      this.scrapeLidl(query),
      this.scrapeAldi(query),
      this.scrapePenny(query)
    ]);

    return {
      rewe: results[0].status === 'fulfilled' ? results[0].value : [],
      lidl: results[1].status === 'fulfilled' ? results[1].value : [],
      aldi: results[2].status === 'fulfilled' ? results[2].value : [],
      penny: results[3].status === 'fulfilled' ? results[3].value : []
    };
  }
}

module.exports = new SupermarketScraper(); 