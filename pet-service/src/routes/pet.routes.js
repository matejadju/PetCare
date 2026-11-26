import { Router } from 'express';

import * as petController
    from '../controllers/pet.controller.js';

import * as weightController
    from '../controllers/weight.controller.js';

import {
    authenticate,
    authorize
} from '../middleware/auth.middleware.js';

import {
    requirePetOwner,
    requirePetAccess
} from '../middleware/pet.middleware.js';

const router = Router();

// JWT authentication for all routes
router.use(authenticate);

// Get owner's pets
router.get(
    '/',
    authorize('OWNER'),
    petController.getAll
);

// Create pet
router.post(
    '/',
    authorize('OWNER'),
    petController.create
);

// Get pet details
router.get(
    '/:id',
    authorize('OWNER', 'VETERINARIAN'),
    requirePetAccess,
    petController.getOne
);

// Update pet
router.put(
    '/:id',
    authorize('OWNER'),
    requirePetOwner,
    petController.update
);

// Delete pet
router.delete(
    '/:id',
    authorize('OWNER'),
    requirePetOwner,
    petController.remove
);

// Get weight history
router.get(
    '/:id/weights',
    authorize('OWNER', 'VETERINARIAN'),
    requirePetAccess,
    weightController.getAll
);

// Create weight measurement
router.post(
    '/:id/weights',
    authorize('OWNER'),
    requirePetOwner,
    weightController.create
);

// Update weight measurement
router.put(
    '/:id/weights/:weightId',
    authorize('OWNER'),
    requirePetOwner,
    weightController.update
);

// Delete weight measurement
router.delete(
    '/:id/weights/:weightId',
    authorize('OWNER'),
    requirePetOwner,
    weightController.remove
);

export default router;