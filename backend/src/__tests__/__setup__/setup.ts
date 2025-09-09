// Test setup file
import { jest } from '@jest/globals';

// Mock console methods to avoid noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-todoapp';

// Set up global test timeout
jest.setTimeout(30000);
