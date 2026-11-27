import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';

import healthRoutes from './routes/health.routes.js';
import userRoutes from './routes/user.routes.js';
import petRoutes from './routes/pet.routes.js';
import veterinarianRoutes from './routes/veterinarian.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';

const app = express();

app.disable('x-powered-by');

app.use(cors({
    origin: config.frontendUrl,
    credentials: true
}));

app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => {
    res.json({
        service: 'PetCare Frontend API',
        status: 'running'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy'
    });
});

app.use('/api', healthRoutes);
app.use('/api', userRoutes);
app.use('/api', petRoutes);
app.use('/api', veterinarianRoutes);
app.use('/api', appointmentRoutes);

export default app;