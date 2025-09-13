import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import todoRouter from './v1/components/todo/todoRouter';
import database from './config/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'todo-backend'
    });
});

// API routes
app.use('/api/todos', todoRouter);

// 404 handler - use a more specific pattern
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Global error:', error);

    res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Internal server error'
    });
});

// Initialize database connection
const initializeApp = async () => {
    try {
        await database.connect();
        console.log('🗄️ Database connected successfully');

        // Start server after database connection
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`📝 API docs: http://localhost:${PORT}/api/todos`);
        });
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Gracefully shutting down...');
    try {
        await database.disconnect();
        console.log('✅ Database disconnected successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Gracefully shutting down...');
    try {
        await database.disconnect();
        console.log('✅ Database disconnected successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

// Initialize the application
initializeApp();

export default app;
