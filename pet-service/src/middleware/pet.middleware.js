import prisma from '../config/database.js';

import {
    petIdSchema
} from '../validators/pet.validator.js';

import {
    createError
} from '../utils/errors.js';

export async function requirePetOwner(req, res, next) {
    try {
        const id = petIdSchema.parse(req.params.id);

        const pet = await prisma.pet.findUnique({
            where: { id },
            select: {
                id: true,
                ownerId: true
            }
        });

        if (!pet) {
            throw createError(
                'Pet not found',
                404,
                'PET_NOT_FOUND'
            );
        }

        if (
            req.user.role !== 'OWNER' ||
            pet.ownerId !== req.user.sub
        ) {
            throw createError(
                'You can only access your own pets',
                403,
                'ACCESS_DENIED'
            );
        }

        req.pet = pet;

        next();

    } catch (error) {
        next(error);
    }
}