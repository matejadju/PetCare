import {
    createPetSchema,
    updatePetSchema
} from '../validators/pet.validator.js';

import {
    getPets,
    getPetById,
    createPet,
    updatePet,
    deletePet
} from '../services/pet.service.js';

export async function getAll(req, res, next) {
    try {
        const pets = await getPets(req.user.sub);

        return res.status(200).json(pets);

    } catch (error) {
        next(error);
    }
}

export async function getOne(req, res, next) {
    try {
        const pet = await getPetById(
            req.pet.id,
            req.user
        );

        return res.status(200).json(pet);

    } catch (error) {
        next(error);
    }
}

export async function create(req, res, next) {
    try {
        const data = createPetSchema.parse(req.body);

        const pet = await createPet(
            req.user.sub,
            data
        );

        return res.status(201).json({
            message: 'Pet created successfully',
            pet
        });

    } catch (error) {
        next(error);
    }
}

export async function update(req, res, next) {
    try {
        const data = updatePetSchema.parse(req.body);

        const pet = await updatePet(
            req.pet.id,
            req.user.sub,
            data
        );

        return res.status(200).json({
            message: 'Pet updated successfully',
            pet
        });

    } catch (error) {
        next(error);
    }
}

export async function remove(req, res, next) {
    try {
        await deletePet(
            req.pet.id,
            req.user.sub,
            req.headers.authorization
        );

        return res.status(204).send();

    } catch (error) {
        next(error);
    }
}