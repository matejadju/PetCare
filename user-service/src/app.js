import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import prisma from './config/database.js';
import userRoutes from './routes/user.routes.js';
import {
    errorHandler
} from './middleware/error.middleware.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        return res.status(200).json({
            service: 'user-service',
            status: 'UP',
            database: 'UP',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return res.status(503).json({
            service: 'user-service',
            status: 'DOWN',
            database: 'DOWN',
            timestamp: new Date().toISOString()
        });
    }
});

app.use('/users', userRoutes);

app.use((req, res) => {
    return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Endpoint not found'
    });
});

app.use(errorHandler);

export default app;