import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

import prisma from './config/database.js';

import petRoutes from './routes/pet.routes.js';

import {
    errorHandler
} from './middleware/error.middleware.js';

const app = express();

// OpenAPI configuration
const openApiPath = fileURLToPath(
    new URL('../openapi.yaml', import.meta.url)
);

const openApiDocument = YAML.parse(
    fs.readFileSync(openApiPath, 'utf8')
);

// Application middleware
app.disable('x-powered-by');

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            upgradeInsecureRequests: null
        }
    }
}));

app.use(cors());
app.use(express.json({ limit: '100kb' }));

// OpenAPI YAML
app.get('/openapi.yaml', (req, res) => {
    res.type('application/yaml');
    return res.sendFile(openApiPath);
});

// OpenAPI JSON
app.get('/openapi.json', (req, res) => {
    return res.status(200).json(openApiDocument);
});

// Swagger UI
app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
        customSiteTitle: 'PetCare Pet Service API',
        swaggerOptions: {
            persistAuthorization: false,
            displayRequestDuration: true
        }
    })
);

// Health check
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        return res.status(200).json({
            service: 'pet-service',
            status: 'UP',
            database: 'UP',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return res.status(503).json({
            service: 'pet-service',
            status: 'DOWN',
            database: 'DOWN',
            timestamp: new Date().toISOString()
        });
    }
});

// Pet REST API
app.use('/pets', petRoutes);

// Unknown routes
app.use((req, res) => {
    return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Endpoint not found'
    });
});

// Global error handler
app.use(errorHandler);

export default app;