// __tests__/utils/testUtils.js

const createMockPage = () => ({
    // Navigation
    goto: jest.fn().mockResolvedValue(undefined),
    waitForSelector: jest.fn().mockResolvedValue(undefined),
    waitForTimeout: jest.fn().mockResolvedValue(undefined),
    url: jest.fn().mockReturnValue('https://example.com'),

    // Interactions
    fill: jest.fn().mockResolvedValue(undefined),
    click: jest.fn().mockResolvedValue(undefined),
    keyboard: {
        press: jest.fn().mockResolvedValue(undefined)
    },

    // Content & Evaluation
    content: jest.fn().mockResolvedValue('<html><body>Mock Content</body></html>'),
    $$eval: jest.fn().mockResolvedValue([{ textContent: 'Movie 1', offsetParent: {} }]),

    // Events
    on: jest.fn(),

    // Screenshots & Debug
    screenshot: jest.fn().mockResolvedValue(Buffer.from(''))
});

const createMockBrowser = () => {
    const mockPage = createMockPage();
    const mockContext = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn().mockResolvedValue(undefined)
    };

    return {
        newContext: jest.fn().mockResolvedValue(mockContext),
        close: jest.fn().mockResolvedValue(undefined),
        _mockContext: mockContext,
        _mockPage: mockPage
    };
};

module.exports = {
    createMockPage,
    createMockBrowser
};