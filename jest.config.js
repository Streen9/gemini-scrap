module.exports = {
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFiles: ['./__tests__/setup.js'],
    testMatch: ['**/__tests__/**/*.test.js'],
    testTimeout: 30000,
    modulePathIgnorePatterns: ['<rootDir>/coverage/'],
    clearMocks: true,
    resetMocks: true,
};