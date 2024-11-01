const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') });

// Mock console methods for cleaner test output
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

// Create mock fs implementation
const mockFs = {
    readFile: jest.fn().mockResolvedValue(Buffer.from('test content')),
    writeFile: jest.fn().mockResolvedValue(undefined),
    mkdir: jest.fn().mockResolvedValue(undefined)
};

// Mock window.fs
global.window = {
    fs: mockFs
};