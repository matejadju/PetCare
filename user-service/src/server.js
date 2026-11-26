import 'dotenv/config';
import app from './app.js';
import prisma from './config/database.js';

const PORT = Number(process.env.PORT || 8001);

let server;

async function startServer() {
    try {
        await prisma.$connect();

        console.log('PostgreSQL database connected successfully');

        server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`User Service is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start User Service:', error);

        await prisma.$disconnect();
        process.exit(1);
    }
}

function shutdown() {
    console.log('Shutting down User Service...');

    server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();