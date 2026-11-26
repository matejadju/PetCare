import prisma from '../config/database.js';

import {
    createError
} from '../utils/errors.js';

import {
    hasActivePetAppointments
} from '../clients/appointment.client.js';

const latestWeightInclude = {
    weights: {
        orderBy: [
            { measuredAt: 'desc' },
            { createdAt: 'desc' },
            { id: 'desc' }
        ],
        take: 1
    }
};

function formatPet(pet) {
    const { weights, ...petData } = pet;

    return {
        ...petData,
        weight: weights?.length
            ? Number(weights[0].weight)
            : null
    };
}

// GET /pets
export async function getPets(ownerId) {
    const pets = await prisma.pet.findMany({
        where: {
            ownerId
        },
        include: latestWeightInclude,
        orderBy: {
            createdAt: 'desc'
        }
    });

    return pets.map(formatPet);
}

// GET /pets/:id
export async function getPetById(id, ownerId) {
    const pet = await prisma.pet.findFirst({
        where: { id, ownerId },
        include: latestWeightInclude
    });

    if (!pet) {
        throw createError(
            'Pet not found',
            404,
            'PET_NOT_FOUND'
        );
    }

    return formatPet(pet);
}

// POST /pets
export async function createPet(ownerId, data) {
    const {
        weight,
        birthDate,
        ...petData
    } = data;

    const pet = await prisma.pet.create({
        data: {
            ...petData,
            ownerId,

            birthDate: birthDate
                ? new Date(birthDate)
                : null,

            ...(weight !== undefined && {
                weights: {
                    create: {
                        weight
                    }
                }
            })
        },
        include: latestWeightInclude
    });

    return formatPet(pet);
}

// PUT /pets/:id
export async function updatePet(id, ownerId, data) {
    const {
        birthDate,
        ...petData
    } = data;

    if (birthDate !== undefined) {
        petData.birthDate = birthDate
            ? new Date(birthDate)
            : null;
    }

    const pet = await prisma.pet.update({
        where: { id, ownerId },
        data: petData,
        include: latestWeightInclude
    });

    return formatPet(pet);
}

// DELETE /pets/:id
export async function deletePet(
    id,
    ownerId,
    authorization
) {
    const hasActiveAppointments =
        await hasActivePetAppointments(
            id,
            authorization
        );

    if (hasActiveAppointments) {
        throw createError(
            'Cannot delete pet with active appointments',
            409,
            'ACTIVE_APPOINTMENTS_EXIST'
        );
    }

    await prisma.pet.delete({
        where: {
            id,
            ownerId
        }
    });
}