import prisma from '../config/database.js';

import {
    createError
} from '../utils/errors.js';

function formatWeight(measurement) {
    return {
        ...measurement,
        weight: Number(measurement.weight)
    };
}

// GET /pets/:id/weights
export async function getWeights(petId) {
    const measurements = await prisma.petWeight.findMany({
        where: {
            petId
        },
        orderBy: [
            { measuredAt: 'desc' },
            { createdAt: 'desc' },
            { id: 'desc' }
        ]
    });

    return measurements.map(formatWeight);
}

// POST /pets/:id/weights
export async function createWeight(petId, data) {
    const measurement = await prisma.petWeight.create({
        data: {
            petId,
            weight: data.weight,

            measuredAt: data.measuredAt
                ? new Date(data.measuredAt)
                : new Date()
        }
    });

    return formatWeight(measurement);
}

// PUT /pets/:id/weights/:weightId
export async function updateWeight(
    petId,
    weightId,
    data
) {
    const updateData = {};

    if (data.weight !== undefined) {
        updateData.weight = data.weight;
    }

    if (data.measuredAt !== undefined) {
        updateData.measuredAt = new Date(
            data.measuredAt
        );
    }

    const measurement = await prisma.petWeight.update({
        where: {
            id: weightId,
            petId
        },
        data: updateData
    });

    return formatWeight(measurement);
}

// DELETE /pets/:id/weights/:weightId
export async function deleteWeight(
    petId,
    weightId
) {
    const result = await prisma.petWeight.deleteMany({
        where: {
            id: weightId,
            petId
        }
    });

    if (result.count === 0) {
        throw createError(
            'Weight measurement not found',
            404,
            'WEIGHT_NOT_FOUND'
        );
    }
}