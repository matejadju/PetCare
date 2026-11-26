import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateToken } from '../utils/jwt.js';

export const publicUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    phone: true,
    avatarUrl: true,
    createdAt: true,
    updatedAt: true
};

export async function registerUser(data) {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    });

    if (existingUser) {
        const error = new Error(
            'Email is already registered'
        );
        error.status = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(
        data.password,
        12
    );

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            passwordHash,
            phone: data.phone,
            role: 'OWNER'
        },
        select: publicUserSelect
    });

    return user;
}

export async function loginUser(data) {
    const user = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    });

    const isPasswordValid = user
        ? await bcrypt.compare(
            data.password,
            user.passwordHash
        )
        : false;

    if (!user || !isPasswordValid) {
        const error = new Error(
            'Invalid email or password'
        );
        error.status = 401;
        error.code = 'INVALID_CREDENTIALS';
        throw error;
    }

    const token = generateToken(user);

    const { passwordHash, ...safeUser } = user;

    return {
        token,
        tokenType: 'Bearer',
        user: safeUser
    };
}