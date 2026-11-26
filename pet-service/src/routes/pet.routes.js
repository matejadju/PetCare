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
    requirePetOwner
} from '../middleware/pet.middleware.js';

const router = Router();

// JWT authentication for all pet routes
router.use(authenticate);

// Owner authorization
router.use(authorize('OWNER'));

// Pet operations
router.get(
    '/',
    petController.getAll
);

router.post(
    '/',
    petController.create
);

router.get(
    '/:id',
    requirePetOwner,
    petController.getOne
);

router.put(
    '/:id',
    requirePetOwner,
    petController.update
);

router.delete(
    '/:id',
    requirePetOwner,
    petController.remove
);

// Weight history operations
router.get(
    '/:id/weights',
    requirePetOwner,
    weightController.getAll
);

router.post(
    '/:id/weights',
    requirePetOwner,
    weightController.create
);

router.put(
    '/:id/weights/:weightId',
    requirePetOwner,
    weightController.update
);

router.delete(
    '/:id/weights/:weightId',
    requirePetOwner,
    weightController.remove
);

export default router;