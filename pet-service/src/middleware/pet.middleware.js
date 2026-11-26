import prisma from '../config/database.js';

import {
    petIdSchema
} from '../validators/pet.validator.js';

import {
    createError
} from '../utils/errors.js';

async function findPet(id) {
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

    return pet;
}

// Access restricted to the pet owner
export async function requirePetOwner(req, res, next) {
    try {
        const id = petIdSchema.parse(req.params.id);

        const pet = await findPet(id);

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

// Read access for owners and veterinarians
export async function requirePetAccess(req, res, next) {
    try {
        const id = petIdSchema.parse(req.params.id);

        const pet = await findPet(id);

        const isOwner =
            req.user.role === 'OWNER' &&
            pet.ownerId === req.user.sub;

        const isVeterinarian =
            req.user.role === 'VETERINARIAN';

        if (!isOwner && !isVeterinarian) {
            throw createError(
                'You do not have access to this pet',
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