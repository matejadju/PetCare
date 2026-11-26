import {
    userIdSchema,
    updateUserSchema,
    changePasswordSchema
} from '../validators/user.validator.js';

import {
    getUserById,
    updateUser,
    changePassword,
    deleteUser,
    deleteAvatar
} from '../services/user.service.js';

export async function getUser(req, res, next) {
    try {
        const id = userIdSchema.parse(req.params.id);

        const user = await getUserById(
            id,
            req.user.sub
        );

        return res.status(200).json(user);

    } catch (error) {
        next(error);
    }
}

export async function update(req, res, next) {
    try {
        const id = userIdSchema.parse(req.params.id);

        const data = updateUserSchema.parse(req.body);

        const user = await updateUser(id, data);

        return res.status(200).json({
            message: 'User updated successfully',
            user
        });

    } catch (error) {
        next(error);
    }
}

export async function updatePassword(req, res, next) {
    try {
        const id = userIdSchema.parse(req.params.id);

        const data = changePasswordSchema.parse(
            req.body
        );

        await changePassword(id, data);

        return res.status(200).json({
            message: 'Password changed successfully'
        });

    } catch (error) {
        next(error);
    }
}

export async function remove(req, res, next) {
    try {
        const id = userIdSchema.parse(req.params.id);

        await deleteUser(id);

        return res.status(204).send();

    } catch (error) {
        next(error);
    }
}

export async function removeAvatar(req, res, next) {
    try {
        const id = userIdSchema.parse(req.params.id);

        const user = await deleteAvatar(id);

        return res.status(200).json({
            message: 'Avatar removed successfully',
            user
        });

    } catch (error) {
        next(error);
    }
}