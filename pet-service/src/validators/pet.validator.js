import { z } from 'zod';

export const petIdSchema = z.string().uuid(
    'Invalid pet ID'
);

const birthDateSchema = z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
    .refine(value => {
        const date = new Date(value);

        return !Number.isNaN(date.getTime())
            && date.toISOString().slice(0, 10) === value
            && date <= new Date();
    }, 'Invalid birth date');

const imageUrlSchema = z.string()
    .url()
    .max(2048)
    .refine(
        value => value.startsWith('https://'),
        'Image URL must use HTTPS'
    );

export const weightValueSchema = z.number()
    .positive()
    .max(9999.999)
    .refine(
        value => Math.abs(
            value * 1000 - Math.round(value * 1000)
        ) < 0.000001,
        'Weight can have at most three decimal places'
    );

const petFields = {
    name: z.string()
        .trim()
        .min(1)
        .max(100),

    species: z.string()
        .trim()
        .min(1)
        .max(50),

    breed: z.string()
        .trim()
        .min(1)
        .max(100)
        .nullable()
        .optional(),

    birthDate: birthDateSchema
        .nullable()
        .optional(),

    gender: z.enum([
        'MALE',
        'FEMALE',
        'UNKNOWN'
    ]).optional(),

    imageUrl: imageUrlSchema
        .nullable()
        .optional()
};

export const createPetSchema = z.object({
    ...petFields,
    weight: weightValueSchema.optional()
}).strict();

export const updatePetSchema = z.object(
    petFields
).partial().strict().refine(
    data => Object.keys(data).length > 0,
    'At least one field must be provided'
);