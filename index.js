const logger = require('./config/logger');
const BookMyShowScraper = require('./scrapers/bookmyshow');
const { SCRAPER_TYPES } = require('./constants');

class ScraperManager {
    constructor() {
        this.scrapers = new Map([
            [SCRAPER_TYPES.BOOKMYSHOW, BookMyShowScraper]
        ]);
    }

    async runScraper(type, options = {}) {
        try {
            logger.info('Starting scraper', { type, options });

            const ScraperClass = this.scrapers.get(type);
            if (!ScraperClass) {
                throw new Error(`Unsupported scraper type: ${type}`);
            }

            const scraper = new ScraperClass(options.location);
            const result = await scraper.scrape();

            logger.info('Scraper completed successfully', { type });
            return result;

        } catch (error) {
            logger.error('Scraper failed', { type, error });
            throw error;
        }
    }
}

// Example usage
if (require.main === module) {
    const manager = new ScraperManager();
    manager.runScraper(SCRAPER_TYPES.BOOKMYSHOW, { location: 'vizianagaram' })
        .catch(error => {
            logger.error('Failed to run scraper', { error });
            process.exit(1);
        });
}

module.exports = new ScraperManager();