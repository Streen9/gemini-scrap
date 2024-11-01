const logger = require('../config/logger');
const browserManager = require('../lib/browser');
const { geminiGenerate } = require('../utils/gemini');
const constants = require('../constants');
const fs = require('fs').promises;
const path = require('path');

class BookMyShowScraper {
    constructor(location = 'vizianagaram') {
        this.location = location;
        // Get scraper-specific constants
        this.constants = constants.getScraperConstants(constants.SCRAPER_TYPES.bookmyshow);
        this.validateLocation(location);
    }

    validateLocation(location) {
        if (!this.constants.PATTERNS.LOCATION.test(location)) {
            throw new Error(this.constants.ERRORS.LOCATION_INVALID);
        }
    }

    async _extractMoviesData(page) {
        const { SELECTORS, ERRORS } = this.constants;
        try {
            // First log the attempt to get page content
            logger.info('Attempting to get page content');

            const pageContent = await page.content();
            logger.info('Successfully got page content', {
                contentLength: pageContent.length
            });

            // Log the Gemini prompt
            const prompt = `fetch the movies {names}, {languages}, {title} and {links} from this page content: ${pageContent}`;
            logger.info('Sending prompt to Gemini', {
                promptLength: prompt.length
            });

            // Get Gemini response
            const moviesString = await geminiGenerate(prompt);
            logger.info('Received response from Gemini', {
                responseLength: moviesString?.length || 0,
                response: moviesString?.substring(0, 200) // Log first 200 chars for debugging
            });

            if (!moviesString) {
                throw new Error('Gemini returned null or empty response');
            }

            // Clean the response
            logger.info('Cleaning Gemini response');
            const cleanedMoviesString = moviesString.replace(/```json/g, '').replace(/```/g, '').trim();
            logger.info('Cleaned response', {
                cleanedLength: cleanedMoviesString.length,
                cleanedSample: cleanedMoviesString.substring(0, 200) // Log sample for debugging
            });

            // Parse JSON
            logger.info('Attempting to parse JSON');
            let movies;
            try {
                movies = JSON.parse(cleanedMoviesString);
            } catch (parseError) {
                logger.error('JSON Parse Error', {
                    error: parseError.message,
                    receivedData: cleanedMoviesString.substring(0, 500) // Log more context
                });
                throw new Error(`Failed to parse JSON: ${parseError.message}`);
            }

            if (!movies || typeof movies !== 'object') {
                throw new Error('Parsed result is not a valid object');
            }

            logger.info('Successfully extracted movies data', {
                movieCount: Object.keys(movies).length,
                movieSample: JSON.stringify(movies).substring(0, 200) // Log sample for verification
            });

            return movies;

        } catch (error) {
            logger.error('Failed to extract movies data', {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                },
                location: this.location
            });
            throw new Error(`Movie data extraction failed: ${error.message}`);
        }
    }

    async _logPageState(page) {
        try {
            // Log current URL
            const url = page.url();
            logger.info('Current page URL', { url });

            // Log visible elements
            const movieElements = await page.$$eval(this.constants.SELECTORS.MOVIES.LIST,
                elements => elements.map(el => ({
                    text: el.textContent,
                    isVisible: el.offsetParent !== null
                }))
            );
            logger.info('Movie elements found', { movieElements });

            // Take screenshot for debugging
            await page.screenshot({
                path: path.join(constants.OUTPUT_PATHS.BASE_DIR, 'debug_screenshot.png'),
                fullPage: true
            });
            logger.info('Debug screenshot saved');

            // Log page console messages
            page.on('console', msg => {
                logger.debug('Browser console:', {
                    type: msg.type(),
                    text: msg.text()
                });
            });

        } catch (error) {
            logger.error('Failed to log page state', { error });
        }
    }

    async scrape() {
        let page;
        try {
            const context = await browserManager.initialize();
            page = await context.newPage();

            // Enable more verbose logging
            page.on('console', msg => logger.debug('Browser console:', msg.text()));
            page.on('pageerror', error => logger.error('Browser page error:', error));

            logger.info('Starting BookMyShow scraping', { location: this.location });

            // Navigate to website
            await page.goto(this.constants.URL.BASE, {
                waitUntil: 'networkidle',
                timeout: this.constants.TIMEOUTS.NAVIGATION
            });
            await page.waitForTimeout(this.constants.TIMEOUTS.ANIMATION);

            // Log page state before proceeding
            await this._logPageState(page);

            // Handle location
            await this._setLocation(page);
            await this._logPageState(page);

            // Navigate to movies section
            await this._navigateToMovies(page);
            await this._logPageState(page);

            // Extract movies data
            const movies = await this._extractMoviesData(page);

            // Save data
            await this._saveMoviesData(movies);

            logger.info('Successfully completed BookMyShow scraping');
            return movies;

        } catch (error) {
            logger.error('Failed to scrape BookMyShow', {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                },
                location: this.location
            });
            throw error;
        } finally {
            if (page) {
                await browserManager.close();
            }
        }
    }

    async _setLocation(page) {
        const { SELECTORS, TIMEOUTS, ERRORS } = this.constants;
        try {
            await page.waitForSelector(SELECTORS.LOCATION.INPUT, {
                timeout: TIMEOUTS.ELEMENT
            });

            await page.fill(SELECTORS.LOCATION.INPUT, this.location);
            await page.waitForTimeout(TIMEOUTS.LOCATION_SEARCH);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(TIMEOUTS.ANIMATION);

            logger.info('Location set successfully', { location: this.location });
        } catch (error) {
            logger.error('Failed to set location', { error });
            throw new Error(ERRORS.LOCATION_NOT_FOUND);
        }
    }

    async _navigateToMovies(page) {
        const { SELECTORS, TIMEOUTS } = this.constants;
        try {
            await page.click(SELECTORS.MOVIES.LINK);
            await page.waitForTimeout(TIMEOUTS.ANIMATION);
            await page.waitForSelector(SELECTORS.MOVIES.LIST);
            logger.info('Navigated to movies section successfully');
        } catch (error) {
            logger.error('Failed to navigate to movies section', { error });
            throw error;
        }
    }

    async _saveMoviesData(movies) {
        const { OUTPUT } = this.constants;
        try {
            // Ensure output directory exists
            await fs.mkdir(constants.OUTPUT_PATHS.BASE_DIR, { recursive: true });

            const outputPath = path.join(
                constants.OUTPUT_PATHS.BASE_DIR,
                OUTPUT.FILENAME
            );

            await fs.writeFile(
                outputPath,
                JSON.stringify(movies, null, 0)
            );

            // Create backup with date
            const backupFilename = OUTPUT.BACKUP_PATTERN.replace(
                '{date}',
                new Date().toISOString().split('T')[0]
            );
            const backupPath = path.join(
                constants.OUTPUT_PATHS.BASE_DIR,
                backupFilename
            );

            await fs.writeFile(
                backupPath,
                JSON.stringify(movies, null, 2)
            );

            logger.info('Successfully saved movies data to files', {
                outputPath,
                backupPath
            });
        } catch (error) {
            logger.error('Failed to save movies data', { error });
            throw error;
        }
    }
}

module.exports = BookMyShowScraper;