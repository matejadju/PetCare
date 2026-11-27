import { Router } from 'express';
import { forwardPetRequest } from '../services/pet.service.js';

const router = Router();

// Pet operations
router.get('/pets', forwardPetRequest);
router.post('/pets', forwardPetRequest);
router.get('/pets/:id', forwardPetRequest);
router.put('/pets/:id', forwardPetRequest);
router.delete('/pets/:id', forwardPetRequest);

// Weight history operations
router.get('/pets/:id/weights', forwardPetRequest);
router.post('/pets/:id/weights', forwardPetRequest);
router.put('/pets/:id/weights/:weightId', forwardPetRequest);
router.delete('/pets/:id/weights/:weightId', forwardPetRequest);

export default router;