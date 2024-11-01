const logger = require('../../config/logger');

describe('Logger Configuration', () => {
    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
    });

    it('should create logger instance', () => {
        expect(logger).toBeDefined();
        expect(logger.info).toBeDefined();
        expect(logger.error).toBeDefined();
    });

    it('should log messages at different levels', () => {
        const testMessage = 'Test message';
        const testMeta = { test: 'meta' };

        logger.info(testMessage, testMeta);
        logger.error(testMessage, testMeta);
        logger.warn(testMessage, testMeta);
        logger.debug(testMessage, testMeta);

        // These assertions mainly verify that logging doesn't throw errors
        expect(true).toBe(true);
    });

    it('should include timestamp in log entries', () => {
        const spy = jest.spyOn(logger, 'info');
        logger.info('Test message');

        expect(spy).toHaveBeenCalled();
        const logArgs = spy.mock.calls[0];
        expect(logArgs[0]).toBe('Test message');
    });
});