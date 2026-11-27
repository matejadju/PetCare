import { Router } from 'express';
import {
    forwardVeterinarianRequest,
} from '../services/veterinarian.service.js';

const router = Router();

// Veterinarians
router.get('/veterinarians', forwardVeterinarianRequest);
router.post('/veterinarians', forwardVeterinarianRequest);

router.get('/veterinarians/:id', forwardVeterinarianRequest);
router.put('/veterinarians/:id', forwardVeterinarianRequest);
router.delete('/veterinarians/:id', forwardVeterinarianRequest);

// Availability
router.get(
    '/veterinarians/:id/availability',
    forwardVeterinarianRequest
);

router.post(
    '/veterinarians/:id/availability',
    forwardVeterinarianRequest
);

router.put(
    '/veterinarians/:id/availability/:availabilityId',
    forwardVeterinarianRequest
);

router.delete(
    '/veterinarians/:id/availability/:availabilityId',
    forwardVeterinarianRequest
);

export default router;