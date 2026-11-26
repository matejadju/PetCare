import 'dotenv/config';

export const config = Object.freeze({
    port: Number(process.env.PORT || 8000),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:8001',
    healthServiceUrl: process.env.HEALTH_SERVICE_URL || 'http://localhost:8005',
    petServiceUrl: process.env.PET_SERVICE_URL || 'http://localhost:8002',
});