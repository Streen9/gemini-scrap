const playwright = require('playwright');
const logger = require('../config/logger');

class BrowserManager {
    constructor() {
        this.browser = null;
        this.context = null;
    }

    async initialize(options = {}) {
        try {
            this.browser = await playwright.chromium.launch({
                headless: process.env.HEADLESS !== 'false',
                ...options
            });

            this.context = await this.browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                viewport: { width: 1280, height: 720 }
            });

            logger.info('Browser initialized successfully');
            return this.context;
        } catch (error) {
            logger.error('Failed to initialize browser', { error });
            throw error;
        }
    }

    async close() {
        try {
            if (this.browser) {
                await this.browser.close();
                logger.info('Browser closed successfully');
            }
        } catch (error) {
            logger.error('Failed to close browser', { error });
            throw error;
        }
    }
}

module.exports = new BrowserManager();