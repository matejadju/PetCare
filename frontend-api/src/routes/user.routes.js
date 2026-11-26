import { Router } from 'express';
import { forwardUserRequest } from '../services/user.service.js';

const router = Router();

// Authentication
router.post('/users/register', forwardUserRequest);
router.post('/users/login', forwardUserRequest);

// User profile
router.get('/users/me', forwardUserRequest);
router.get('/users/:id', forwardUserRequest);
router.put('/users/:id', forwardUserRequest);

// Password management
router.put('/users/:id/password', forwardUserRequest);

// Delete account and avatar
router.delete('/users/:id', forwardUserRequest);
router.delete('/users/:id/avatar', forwardUserRequest);

export default router;