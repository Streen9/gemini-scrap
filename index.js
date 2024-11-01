const logger = require('./config/logger');
const BookMyShowScraper = require('./scrapers/bookmyshow');
const { SCRAPER_TYPES } = require('./constants');

class ScraperManager {
    constructor() {
        // Initialize the scrapers map
        this.scrapers = {
            [SCRAPER_TYPES.bookmyshow]: BookMyShowScraper
        };
    }

    async runScraper(type, options = {}) {
        try {
            logger.info('Starting scraper', { type, options });

            const ScraperClass = this.scrapers[type];
            if (!ScraperClass) {
                throw new Error(`Unsupported scraper type: ${type}`);
            }

            const scraper = new ScraperClass(options.location);
            const result = await scraper.scrape();

            logger.info('Scraper completed successfully', { type });
            return result;

        } catch (error) {
            logger.error('Scraper failed', { error, type });
            throw error;
        }
    }
}

module.exports = new ScraperManager();