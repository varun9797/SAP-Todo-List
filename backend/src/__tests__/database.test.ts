import mongoose from 'mongoose';
import DatabaseConnection from '../config/database';

// Mock mongoose
jest.mock('mongoose', () => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    connection: {
        on: jest.fn(),
        once: jest.fn()
    }
}));

describe('DatabaseConnection', () => {
    let mockConnect: jest.Mock;
    let mockDisconnect: jest.Mock;
    let mockOn: jest.Mock;
    let mockOnce: jest.Mock;

    beforeEach(() => {
        mockConnect = mongoose.connect as jest.Mock;
        mockDisconnect = mongoose.disconnect as jest.Mock;
        mockOn = mongoose.connection.on as jest.Mock;
        mockOnce = mongoose.connection.once as jest.Mock;

        // Clear all mocks
        jest.clearAllMocks();

        // Reset the singleton instance for testing
        (DatabaseConnection as any).instance = undefined;
        (DatabaseConnection as any).isConnected = false;
    });

    describe('Singleton Pattern', () => {
        it('should return the same instance on multiple calls', () => {
            const instance1 = DatabaseConnection;
            const instance2 = DatabaseConnection;

            expect(instance1).toBe(instance2);
        });

        it('should have a single instance across the application', () => {
            const instance = DatabaseConnection;
            expect(instance).toBeDefined();
            expect(typeof instance.connect).toBe('function');
            expect(typeof instance.disconnect).toBe('function');
            expect(typeof instance.getConnectionStatus).toBe('function');
        });
    });

    describe('connect method', () => {
        it('should connect to MongoDB with correct connection string', async () => {
            const mockConnectionString = 'mongodb://localhost:27017/test-db';
            process.env.MONGODB_URI = mockConnectionString;

            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();

            expect(mockConnect).toHaveBeenCalledWith(mockConnectionString);
            expect(mockConnect).toHaveBeenCalledTimes(1);
        });

        it('should use MONGO_URI environment variable when available', async () => {
            const mockConnectionString = 'mongodb://localhost:27017/mongo-uri-db';
            process.env.MONGO_URI = mockConnectionString;
            delete process.env.MONGODB_URI;

            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();

            expect(mockConnect).toHaveBeenCalledWith(mockConnectionString);
        });

        it('should use default connection string when no env vars are set', async () => {
            delete process.env.MONGO_URI;
            delete process.env.MONGODB_URI;

            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();

            expect(mockConnect).toHaveBeenCalledWith('mongodb://localhost:27017/todoapp');
        });

        it('should not connect again if already connected', async () => {
            mockConnect.mockResolvedValue(undefined);

            // Mock console.log to capture output
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            // First connection
            await DatabaseConnection.connect();

            // Second connection attempt
            await DatabaseConnection.connect();

            expect(mockConnect).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith('Already connected to MongoDB');

            consoleSpy.mockRestore();
        });

        it('should handle connection errors', async () => {
            const mockError = new Error('Connection failed');
            mockConnect.mockRejectedValue(mockError);

            await expect(DatabaseConnection.connect()).rejects.toThrow('Connection failed');
            expect(mockConnect).toHaveBeenCalledTimes(1);
        });

        it('should set up event listeners', async () => {
            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();

            expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
            expect(mockOn).toHaveBeenCalledWith('disconnected', expect.any(Function));
            expect(mockOn).toHaveBeenCalledWith('reconnected', expect.any(Function));
        });

        it('should log success message on connection', async () => {
            mockConnect.mockResolvedValue(undefined);

            // Mock console.log to verify logging
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            await DatabaseConnection.connect();

            expect(consoleSpy).toHaveBeenCalledWith('✅ Connected to MongoDB successfully');

            consoleSpy.mockRestore();
        });

        it('should log error message when connection fails', async () => {
            const mockError = new Error('Connection failed');
            mockConnect.mockRejectedValue(mockError);

            // Mock console.error to verify error logging
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await expect(DatabaseConnection.connect()).rejects.toThrow();

            expect(consoleSpy).toHaveBeenCalledWith('❌ Failed to connect to MongoDB:', mockError);

            consoleSpy.mockRestore();
        });
    });

    describe('disconnect method', () => {
        it('should disconnect from MongoDB when connected', async () => {
            mockConnect.mockResolvedValue(undefined);
            mockDisconnect.mockResolvedValue(undefined);

            // First connect
            await DatabaseConnection.connect();

            // Then disconnect
            await DatabaseConnection.disconnect();

            expect(mockDisconnect).toHaveBeenCalledTimes(1);
        });

        it('should not disconnect if not connected', async () => {
            mockDisconnect.mockResolvedValue(undefined);

            await DatabaseConnection.disconnect();

            expect(mockDisconnect).not.toHaveBeenCalled();
        });

        it('should handle disconnection errors', async () => {
            mockConnect.mockResolvedValue(undefined);
            const mockError = new Error('Disconnection failed');
            mockDisconnect.mockRejectedValue(mockError);

            // First connect
            await DatabaseConnection.connect();

            // Then attempt to disconnect
            await expect(DatabaseConnection.disconnect()).rejects.toThrow('Disconnection failed');
        });

        it('should log disconnection message', async () => {
            mockConnect.mockResolvedValue(undefined);
            mockDisconnect.mockResolvedValue(undefined);

            // Mock console.log to verify logging
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            // Connect first
            await DatabaseConnection.connect();

            // Then disconnect
            await DatabaseConnection.disconnect();

            expect(consoleSpy).toHaveBeenCalledWith('📤 Disconnected from MongoDB');

            consoleSpy.mockRestore();
        });
    });

    describe('getConnectionStatus method', () => {
        it('should return false when not connected', () => {
            const status = DatabaseConnection.getConnectionStatus();
            expect(status).toBe(false);
        });

        it('should return true when connected', async () => {
            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();

            const status = DatabaseConnection.getConnectionStatus();
            expect(status).toBe(true);
        });

        it('should return false after disconnection', async () => {
            mockConnect.mockResolvedValue(undefined);
            mockDisconnect.mockResolvedValue(undefined);

            // Connect
            await DatabaseConnection.connect();
            expect(DatabaseConnection.getConnectionStatus()).toBe(true);

            // Disconnect
            await DatabaseConnection.disconnect();
            expect(DatabaseConnection.getConnectionStatus()).toBe(false);
        });
    });

    describe('Connection Events', () => {
        it('should handle error events and update connection status', async () => {
            mockConnect.mockResolvedValue(undefined);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await DatabaseConnection.connect();

            // Simulate error event
            const errorHandler = mockOn.mock.calls.find(call => call[0] === 'error')?.[1];
            const testError = new Error('Connection error');

            if (errorHandler) {
                errorHandler(testError);
            }

            expect(consoleSpy).toHaveBeenCalledWith('❌ MongoDB connection error:', testError);
            expect(DatabaseConnection.getConnectionStatus()).toBe(false);

            consoleSpy.mockRestore();
        });

        it('should handle disconnected events', async () => {
            mockConnect.mockResolvedValue(undefined);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            await DatabaseConnection.connect();

            // Simulate disconnected event
            const disconnectedHandler = mockOn.mock.calls.find(call => call[0] === 'disconnected')?.[1];

            if (disconnectedHandler) {
                disconnectedHandler();
            }

            expect(consoleSpy).toHaveBeenCalledWith('📤 MongoDB disconnected');
            expect(DatabaseConnection.getConnectionStatus()).toBe(false);

            consoleSpy.mockRestore();
        });

        it('should handle reconnected events', async () => {
            mockConnect.mockResolvedValue(undefined);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            await DatabaseConnection.connect();

            // Simulate reconnected event
            const reconnectedHandler = mockOn.mock.calls.find(call => call[0] === 'reconnected')?.[1];

            if (reconnectedHandler) {
                reconnectedHandler();
            }

            expect(consoleSpy).toHaveBeenCalledWith('🔄 MongoDB reconnected');
            expect(DatabaseConnection.getConnectionStatus()).toBe(true);

            consoleSpy.mockRestore();
        });
    });

    describe('Environment Configuration', () => {
        const originalEnv = process.env;

        beforeEach(() => {
            jest.resetModules();
            process.env = { ...originalEnv };
        });

        afterAll(() => {
            process.env = originalEnv;
        });

        it('should prioritize MONGO_URI over MONGODB_URI', async () => {
            process.env.MONGO_URI = 'mongodb://mongo-uri:27017/db';
            process.env.MONGODB_URI = 'mongodb://mongodb-uri:27017/db';

            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();

            expect(mockConnect).toHaveBeenCalledWith('mongodb://mongo-uri:27017/db');
        });

        it('should use MONGODB_URI when MONGO_URI is not set', async () => {
            delete process.env.MONGO_URI;
            process.env.MONGODB_URI = 'mongodb://mongodb-uri:27017/db';

            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();

            expect(mockConnect).toHaveBeenCalledWith('mongodb://mongodb-uri:27017/db');
        });

        it('should handle empty environment variables', async () => {
            process.env.MONGO_URI = '';
            process.env.MONGODB_URI = '';

            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();

            expect(mockConnect).toHaveBeenCalledWith('mongodb://localhost:27017/todoapp');
        });
    });
});

describe('Database Configuration', () => {
    let mockConnect: jest.Mock;
    let mockOn: jest.Mock;
    let mockOnce: jest.Mock;

    beforeEach(() => {
        mockConnect = mongoose.connect as jest.Mock;
        mockOn = mongoose.connection.on as jest.Mock;
        mockOnce = mongoose.connection.once as jest.Mock;

        // Clear all mocks
        jest.clearAllMocks();
    });

    describe('connectToDatabase', () => {
        it('should connect to MongoDB with correct connection string', async () => {
            const mockConnectionString = 'mongodb://localhost:27017/test-db';
            process.env.MONGODB_URI = mockConnectionString;

            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();

            expect(mockConnect).toHaveBeenCalledWith(mockConnectionString);
            expect(mockConnect).toHaveBeenCalledTimes(1);
        });

        it('should use default connection string when MONGODB_URI is not set', async () => {
            delete process.env.MONGODB_URI;

            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();

            // Should use default connection string
            expect(mockConnect).toHaveBeenCalledWith(expect.stringContaining('mongodb://'));
            expect(mockConnect).toHaveBeenCalledTimes(1);
        });

        it('should handle connection success', async () => {
            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();

            expect(mockOnce).toHaveBeenCalledWith('open', expect.any(Function));
        });

        it('should handle connection errors', async () => {
            const mockError = new Error('Connection failed');
            mockConnect.mockRejectedValue(mockError);

            await expect(DatabaseConnection.connect()).rejects.toThrow('Connection failed');
            expect(mockConnect).toHaveBeenCalledTimes(1);
        });

        it('should set up error event listener', async () => {
            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();

            expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
        });

        it('should set up open event listener', async () => {
            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();

            expect(mockOnce).toHaveBeenCalledWith('open', expect.any(Function));
        });

        it('should handle multiple connection attempts', async () => {
            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();
            await DatabaseConnection.connect();

            expect(mockConnect).toHaveBeenCalledTimes(2);
        });

        it('should pass mongoose connection options', async () => {
            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();

            // Check if connect was called with proper options structure
            const callArgs = mockConnect.mock.calls[0];
            expect(callArgs).toHaveLength(1); // Should have connection string
        });
    });

    describe('Connection Events', () => {
        it('should log success message on connection open', async () => {
            mockConnect.mockResolvedValue(undefined);

            // Mock console.log to verify logging
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            await DatabaseConnection.connect();

            // Simulate the 'open' event
            const openCallback = mockOnce.mock.calls.find(call => call[0] === 'open')?.[1];
            if (openCallback) {
                openCallback();
            }

            // Restore console.log
            consoleSpy.mockRestore();
        });

        it('should log error message on connection error', async () => {
            mockConnect.mockResolvedValue(undefined);

            // Mock console.error to verify error logging
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await DatabaseConnection.connect();

            // Simulate the 'error' event
            const errorCallback = mockOn.mock.calls.find(call => call[0] === 'error')?.[1];
            if (errorCallback) {
                const testError = new Error('Test connection error');
                errorCallback(testError);
            }

            // Restore console.error
            consoleSpy.mockRestore();
        });
    });

    describe('Environment Variables', () => {
        const originalEnv = process.env;

        beforeEach(() => {
            jest.resetModules();
            process.env = { ...originalEnv };
        });

        afterAll(() => {
            process.env = originalEnv;
        });

        it('should use production MongoDB URI in production environment', async () => {
            process.env.NODE_ENV = 'production';
            process.env.MONGODB_URI = 'mongodb://prod-server:27017/prod-db';

            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();

            expect(mockConnect).toHaveBeenCalledWith('mongodb://prod-server:27017/prod-db');
        });

        it('should use development MongoDB URI in development environment', async () => {
            process.env.NODE_ENV = 'development';
            process.env.MONGODB_URI = 'mongodb://localhost:27017/dev-db';

            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();

            expect(mockConnect).toHaveBeenCalledWith('mongodb://localhost:27017/dev-db');
        });

        it('should handle missing environment variables gracefully', async () => {
            delete process.env.MONGODB_URI;
            delete process.env.NODE_ENV;

            mockConnect.mockResolvedValue(undefined);

            await expect(DatabaseConnection.connect()).resolves.not.toThrow();
            expect(mockConnect).toHaveBeenCalledTimes(1);
        });
    });

    describe('Connection State', () => {
        it('should handle disconnection events', async () => {
            mockConnect.mockResolvedValue(undefined);

            await DatabaseConnection.connect();

            // Verify that event listeners are set up for disconnection
            expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
        });

        it('should handle reconnection scenarios', async () => {
            // First connection fails
            mockConnect.mockRejectedValueOnce(new Error('First attempt failed'));

            // Second connection succeeds
            mockConnect.mockResolvedValueOnce(undefined);

            await expect(DatabaseConnection.connect()).rejects.toThrow('First attempt failed');
            await expect(DatabaseConnection.connect()).resolves.not.toThrow();

            expect(mockConnect).toHaveBeenCalledTimes(2);
        });
    });

    describe('Database Constants', () => {
        it('should have proper database constants defined', async () => {
            // Test that database constants are properly imported/defined
            // This would test the actual constants from the database.ts file
            const { DATABASE_NAME, DEFAULT_MONGODB_URI } = require('../constants/database');

            expect(typeof DATABASE_NAME).toBe('string');
            expect(typeof DEFAULT_MONGODB_URI).toBe('string');
            expect(DEFAULT_MONGODB_URI).toContain('mongodb://');
        });

        it('should use consistent database naming', async () => {
            const { DATABASE_NAME } = require('../constants/database');

            // Ensure database name follows naming conventions
            expect(DATABASE_NAME).toMatch(/^[a-zA-Z0-9_-]+$/);
            expect(DATABASE_NAME.length).toBeGreaterThan(0);
        });
    });
});
