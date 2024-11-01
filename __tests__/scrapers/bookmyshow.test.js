// __tests__/scrapers/bookmyshow.test.js

const { createMockPage } = require('../utils/testUtils');

// Mock fs.promises
jest.mock('fs', () => ({
    promises: {
        mkdir: jest.fn().mockResolvedValue(undefined),
        writeFile: jest.fn().mockResolvedValue(undefined)
    }
}));

// Create constants mock object
const mockConstants = {
    PATTERNS: {
        LOCATION: /^[a-zA-Z]+$/
    },
    ERRORS: {
        LOCATION_INVALID: 'Invalid location',
        LOCATION_NOT_FOUND: 'Location not found'
    },
    URL: {
        BASE: 'https://bookmyshow.com'
    },
    TIMEOUTS: {
        NAVIGATION: 30000,
        ELEMENT: 5000,
        ANIMATION: 1000,
        LOCATION_SEARCH: 1000
    },
    SELECTORS: {
        LOCATION: {
            INPUT: '#location-input'
        },
        MOVIES: {
            LINK: '#movies-link',
            LIST: '#movies-list'
        }
    },
    OUTPUT: {
        FILENAME: 'movies.json',
        BACKUP_PATTERN: 'movies-{date}.json'
    }
};

// Mock constants
jest.mock('../../constants', () => ({
    SCRAPER_TYPES: {
        bookmyshow: 'bookmyshow'
    },
    OUTPUT_PATHS: {
        BASE_DIR: '/mock/output'
    },
    getScraperConstants: jest.fn().mockReturnValue(mockConstants)
}));

// Create mock page and context
const mockPage = createMockPage();
const mockContext = {
    newPage: jest.fn().mockResolvedValue(mockPage)
};

// Mock browser manager
const mockClose = jest.fn();
jest.mock('../../lib/browser', () => ({
    initialize: jest.fn().mockResolvedValue(mockContext),
    close: mockClose
}));

// Create mock movie data
const mockMovieData = {
    movies: [
        { name: 'Test Movie 1', language: 'English' },
        { name: 'Test Movie 2', language: 'Hindi' }
    ]
};

// Mock gemini
jest.mock('../../utils/gemini', () => ({
    geminiGenerate: jest.fn().mockResolvedValue(JSON.stringify(mockMovieData))
}));

// Mock logger
jest.mock('../../config/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
}));

const BookMyShowScraper = require('../../scrapers/bookmyshow');
const browserManager = require('../../lib/browser');
const { geminiGenerate } = require('../../utils/gemini');
const constants = require('../../constants');

describe('BookMyShow Scraper', () => {
    let scraper;

    beforeEach(() => {
        jest.clearAllMocks();
        mockContext.newPage.mockResolvedValue(mockPage);
        browserManager.initialize.mockResolvedValue(mockContext);
        browserManager.close.mockImplementation(mockClose);
        constants.getScraperConstants.mockReturnValue(mockConstants);
        mockPage.content.mockResolvedValue('<html><body>Mock Content</body></html>');
        geminiGenerate.mockResolvedValue(JSON.stringify(mockMovieData));
        scraper = new BookMyShowScraper('testCity');
    });

    describe('initialization', () => {
        it('should create instance with valid location', () => {
            expect(scraper.location).toBe('testCity');
            expect(scraper.constants).toEqual(mockConstants);
        });

        it('should throw error for invalid location', () => {
            expect(() => new BookMyShowScraper('123')).toThrow('Invalid location');
        });
    });

    describe('scraping process', () => {
        it('should complete full scraping process successfully', async () => {
            const result = await scraper.scrape();
            
            expect(browserManager.initialize).toHaveBeenCalled();
            expect(mockContext.newPage).toHaveBeenCalled();
            expect(mockPage.goto).toHaveBeenCalledWith(
                'https://bookmyshow.com',
                expect.any(Object)
            );
            expect(mockPage.fill).toHaveBeenCalledWith(
                '#location-input',
                'testCity'
            );
            expect(mockPage.click).toHaveBeenCalledWith('#movies-link');
            expect(mockPage.content).toHaveBeenCalled();
            expect(geminiGenerate).toHaveBeenCalled();
            expect(result).toEqual(mockMovieData);
            expect(browserManager.close).toHaveBeenCalled();
        });

        it('should handle navigation errors', async () => {
            mockPage.goto.mockRejectedValueOnce(new Error('Navigation failed'));
            await expect(scraper.scrape()).rejects.toThrow('Navigation failed');
            expect(browserManager.close).toHaveBeenCalled();
        });

        it('should handle location setting errors', async () => {
            mockPage.fill.mockRejectedValueOnce(new Error('Location setting failed'));
            await expect(scraper.scrape()).rejects.toThrow('Location not found');
            expect(browserManager.close).toHaveBeenCalled();
        });

        it('should handle Gemini processing errors', async () => {
            geminiGenerate.mockRejectedValueOnce(new Error('Gemini failed'));
            await expect(scraper.scrape()).rejects.toThrow('Movie data extraction failed');
            expect(browserManager.close).toHaveBeenCalled();
        });
    });

    describe('cleanup', () => {
        it('should close browser even if scraping fails', async () => {
            browserManager.initialize.mockRejectedValueOnce(new Error('Test error'));
            mockClose.mockResolvedValueOnce(undefined);
            await expect(scraper.scrape()).rejects.toThrow('Test error');
            expect(mockClose).toHaveBeenCalled();
        });
    });
});