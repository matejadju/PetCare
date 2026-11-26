import {
    weightIdSchema,
    createWeightSchema,
    updateWeightSchema
} from '../validators/weight.validator.js';

import {
    getWeights,
    createWeight,
    updateWeight,
    deleteWeight
} from '../services/weight.service.js';

export async function getAll(req, res, next) {
    try {
        const weights = await getWeights(req.pet.id);

        return res.status(200).json(weights);

    } catch (error) {
        next(error);
    }
}

export async function create(req, res, next) {
    try {
        const data = createWeightSchema.parse(
            req.body
        );

        const measurement = await createWeight(
            req.pet.id,
            data
        );

        return res.status(201).json({
            message: 'Weight measurement created successfully',
            measurement
        });

    } catch (error) {
        next(error);
    }
}

export async function update(req, res, next) {
    try {
        const weightId = weightIdSchema.parse(
            req.params.weightId
        );

        const data = updateWeightSchema.parse(
            req.body
        );

        const measurement = await updateWeight(
            req.pet.id,
            weightId,
            data
        );

        return res.status(200).json({
            message: 'Weight measurement updated successfully',
            measurement
        });

    } catch (error) {
        next(error);
    }
}

export async function remove(req, res, next) {
    try {
        const weightId = weightIdSchema.parse(
            req.params.weightId
        );

        await deleteWeight(
            req.pet.id,
            weightId
        );

        return res.status(204).send();

    } catch (error) {
        next(error);
    }
}