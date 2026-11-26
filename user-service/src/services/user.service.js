import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';

import {
    publicUserSelect
} from './auth.service.js';

import {
    hasActiveUserAppointments
} from '../clients/appointment.client.js';

const limitedUserSelect = {
    id: true,
    name: true,
    role: true
};

function createError(message, status, code) {
    const error = new Error(message);

    error.status = status;
    error.code = code;

    return error;
}

async function findUserOrThrow(id) {
    const user = await prisma.user.findUnique({
        where: { id }
    });

    if (!user) {
        throw createError(
            'User not found',
            404,
            'USER_NOT_FOUND'
        );
    }

    return user;
}

// GET /users/:id
export async function getUserById(id, requesterId) {
    const user = await prisma.user.findUnique({
        where: { id },
        select: id === requesterId
            ? publicUserSelect
            : limitedUserSelect
    });

    if (!user) {
        throw createError(
            'User not found',
            404,
            'USER_NOT_FOUND'
        );
    }

    return user;
}

// PUT /users/:id
export async function updateUser(id, data) {
    return prisma.user.update({
        where: { id },
        data,
        select: publicUserSelect
    });
}

// PUT /users/:id/password
export async function changePassword(id, data) {
    const user = await findUserOrThrow(id);

    const isPasswordValid = await bcrypt.compare(
        data.currentPassword,
        user.passwordHash
    );

    if (!isPasswordValid) {
        throw createError(
            'Current password is incorrect',
            400,
            'INVALID_CURRENT_PASSWORD'
        );
    }

    const passwordHash = await bcrypt.hash(
        data.newPassword,
        12
    );

    await prisma.user.update({
        where: { id },
        data: {
            passwordHash
        }
    });
}

// DELETE /users/:id
export async function deleteUser(
    id,
    authorization
) {
    const user = await prisma.user.findUnique({
        where: { id },

        select: {
            id: true
        }
    });

    if (!user) {
        const error = new Error('User not found');

        error.status = 404;
        error.code = 'USER_NOT_FOUND';

        throw error;
    }

    const hasActiveAppointments =
        await hasActiveUserAppointments(
            id,
            authorization
        );

    if (hasActiveAppointments) {
        const error = new Error(
            'Cannot delete user with active appointments'
        );

        error.status = 409;
        error.code = 'ACTIVE_APPOINTMENTS_EXIST';

        throw error;
    }

    await prisma.user.delete({
        where: { id }
    });
}

// DELETE /users/:id/avatar
export async function deleteAvatar(id) {
    return prisma.user.update({
        where: { id },
        data: {
            avatarUrl: null
        },
        select: publicUserSelect
    });
}