import 'dotenv/config';

export const config = Object.freeze({
    port: Number(process.env.PORT || 8000),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL,
    userServiceUrl: process.env.USER_SERVICE_URL,
    healthServiceUrl: process.env.HEALTH_SERVICE_URL
});