import {
    registerSchema,
    loginSchema
} from '../validators/auth.validator.js';

import {
    registerUser,
    loginUser,
    publicUserSelect
} from '../services/auth.service.js';

import prisma from '../config/database.js';

export async function register(req, res, next) {
    try {
        const data = registerSchema.parse(req.body);
        const user = await registerUser(data);

        return res.status(201).json({
            message: 'User registered successfully',
            user
        });

    } catch (error) {
        next(error);
    }
}

export async function login(req, res, next) {
    try {
        const data = loginSchema.parse(req.body);
        const result = await loginUser(data);

        return res.status(200).json({
            message: 'Login successful',
            ...result
        });

    } catch (error) {
        next(error);
    }
}

export async function getMe(req, res, next) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.sub
            },
            select: publicUserSelect
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json(user);

    } catch (error) {
        next(error);
    }
}