// __tests__/lib/browser.test.js

const browserManager = require('../../lib/browser');
const playwright = require('playwright');
const { createMockPage } = require('../utils/testUtils');

// Mock playwright
jest.mock('playwright', () => ({
    chromium: {
        launch: jest.fn()
    }
}));

describe('Browser Manager', () => {
    let mockBrowser;
    let mockPage;
    let mockContext;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockPage = createMockPage();
        mockContext = {
            newPage: jest.fn().mockResolvedValue(mockPage),
            close: jest.fn().mockResolvedValue(undefined)
        };
        mockBrowser = {
            newContext: jest.fn().mockResolvedValue(mockContext),
            close: jest.fn().mockResolvedValue(undefined)
        };

        playwright.chromium.launch.mockResolvedValue(mockBrowser);
    });

    describe('initialization', () => {
        it('should initialize browser successfully', async () => {
            const context = await browserManager.initialize();
            
            expect(playwright.chromium.launch).toHaveBeenCalled();
            expect(mockBrowser.newContext).toHaveBeenCalled();
            expect(context).toBe(mockContext);
        });

        it('should initialize with custom options', async () => {
            const customOptions = { headless: false };
            await browserManager.initialize(customOptions);
            
            expect(playwright.chromium.launch).toHaveBeenCalledWith(
                expect.objectContaining(customOptions)
            );
        });

        it('should handle initialization errors', async () => {
            playwright.chromium.launch.mockRejectedValue(new Error('Launch failed'));
            await expect(browserManager.initialize()).rejects.toThrow('Launch failed');
        });
    });

    describe('closure', () => {
        it('should close browser successfully', async () => {
            await browserManager.initialize();
            await browserManager.close();
            expect(mockBrowser.close).toHaveBeenCalled();
        });

        it('should handle closure errors', async () => {
            await browserManager.initialize();
            mockBrowser.close.mockRejectedValue(new Error('Close failed'));
            await expect(browserManager.close()).rejects.toThrow('Close failed');
        });
    });
});