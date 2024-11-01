const logger = require('../config/logger');
const browserManager = require('../lib/browser');
const { geminiGenerate } = require('../utils/gemini');
const { URLS, SELECTORS, TIMEOUTS, OUTPUT_PATHS } = require('../constants');
const fs = require('fs').promises;

class BookMyShowScraper {
    constructor(location = 'vizianagaram') {
        this.location = location;
    }

    async scrape() {
        let page;
        try {
            const context = await browserManager.initialize();
            page = await context.newPage();

            logger.info('Starting BookMyShow scraping', { location: this.location });

            // Navigate to website
            await page.goto(URLS.BOOKMYSHOW, { waitUntil: 'networkidle' });
            await page.waitForTimeout(TIMEOUTS.ANIMATION);

            // Handle location
            await this._setLocation(page);

            // Navigate to movies section
            await this._navigateToMovies(page);

            // Extract movies data
            const movies = await this._extractMoviesData(page);

            // Save data
            await this._saveMoviesData(movies);

            logger.info('Successfully completed BookMyShow scraping');
            return movies;

        } catch (error) {
            logger.error('Failed to scrape BookMyShow', { error });
            throw error;
        } finally {
            if (page) {
                await browserManager.close();
            }
        }
    }

    async _setLocation(page) {
        try {
            await page.waitForSelector(SELECTORS.BOOKMYSHOW.LOCATION_INPUT, { timeout: TIMEOUTS.NAVIGATION });
            await page.fill(SELECTORS.BOOKMYSHOW.LOCATION_INPUT, this.location);
            await page.waitForTimeout(TIMEOUTS.ANIMATION);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(TIMEOUTS.ANIMATION);
            logger.info('Location set successfully', { location: this.location });
        } catch (error) {
            logger.error('Failed to set location', { error });
            throw error;
        }
    }

    async _navigateToMovies(page) {
        try {
            await page.click(SELECTORS.BOOKMYSHOW.MOVIES_LINK);
            await page.waitForTimeout(TIMEOUTS.ANIMATION);
            await page.waitForSelector(SELECTORS.BOOKMYSHOW.MOVIES_LIST);
            logger.info('Navigated to movies section successfully');
        } catch (error) {
            logger.error('Failed to navigate to movies section', { error });
            throw error;
        }
    }

    async _extractMoviesData(page) {
        try {
            const pageContent = await page.content();
            const moviesString = await geminiGenerate(
                `fetch the movies {names}, {languages}, {title} and {links} from this page content: ${pageContent}`
            );

            const cleanedMoviesString = moviesString.replace(/```json/g, '').replace(/```/g, '').trim();
            const movies = JSON.parse(cleanedMoviesString);
            
            logger.info('Successfully extracted movies data', { 
                movieCount: Object.keys(movies).length 
            });
            
            return movies;
        } catch (error) {
            logger.error('Failed to extract movies data', { error });
            throw error;
        }
    }

    async _saveMoviesData(movies) {
        try {
            await fs.writeFile(
                OUTPUT_PATHS.MOVIES, 
                JSON.stringify(movies, null, 0)
            );
            logger.info('Successfully saved movies data to file');
        } catch (error) {
            logger.error('Failed to save movies data', { error });
            throw error;
        }
    }
}

module.exports = BookMyShowScraper;