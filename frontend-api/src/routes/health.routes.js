import { Router } from 'express';
import { forwardHealthRequest } from '../services/health.service.js';

const router = Router();

// Vaccinations
router.get('/pets/:pet_id/vaccinations', forwardHealthRequest);
router.get('/vaccinations/:id', forwardHealthRequest);
router.post('/vaccinations', forwardHealthRequest);
router.put('/vaccinations/:id', forwardHealthRequest);
router.delete('/vaccinations/:id', forwardHealthRequest);

// Medications
router.get('/pets/:pet_id/medications', forwardHealthRequest);
router.get('/medications/:id', forwardHealthRequest);
router.post('/medications', forwardHealthRequest);
router.put('/medications/:id', forwardHealthRequest);
router.delete('/medications/:id', forwardHealthRequest);

// Health History
router.get('/pets/:pet_id/health-history', forwardHealthRequest);

export default router;