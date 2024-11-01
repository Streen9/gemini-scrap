/**
 * Test helpers and shared utilities
 */
const waitForExpect = async (callback, timeout = 1000) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        try {
            await callback();
            return;
        } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    await callback();
};

const createMockResponse = (data) => ({
    text: jest.fn().mockReturnValue(typeof data === 'string' ? data : JSON.stringify(data))
});

module.exports = {
    waitForExpect,
    createMockResponse
};