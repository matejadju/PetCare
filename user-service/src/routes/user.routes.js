import { Router } from 'express';

import {
    register,
    login,
    getMe
} from '../controllers/auth.controller.js';

import {
    getUser,
    update,
    updatePassword,
    remove,
    removeAvatar
} from '../controllers/user.controller.js';

import {
    authenticate,
    requireSelf
} from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/register', register);

router.post('/login', login);

// Protected GET routes
router.get('/me', authenticate, getMe);

router.get('/:id', authenticate, getUser);

// Protected PUT routes
router.put(
    '/:id',
    authenticate,
    requireSelf,
    update
);

router.put(
    '/:id/password',
    authenticate,
    requireSelf,
    updatePassword
);

// Protected DELETE routes
router.delete(
    '/:id',
    authenticate,
    requireSelf,
    remove
);

router.delete(
    '/:id/avatar',
    authenticate,
    requireSelf,
    removeAvatar
);

export default router;