import { z } from 'zod';

import {
    weightValueSchema
} from './pet.validator.js';

export const weightIdSchema = z.string().uuid(
    'Invalid weight measurement ID'
);

const measuredAtSchema = z.string()
    .datetime({ offset: true })
    .refine(
        value => new Date(value) <= new Date(),
        'Measurement date cannot be in the future'
    );

export const createWeightSchema = z.object({
    weight: weightValueSchema,

    measuredAt: measuredAtSchema.optional()

}).strict();

export const updateWeightSchema = z.object({
    weight: weightValueSchema.optional(),

    measuredAt: measuredAtSchema.optional()

}).strict().refine(
    data => Object.keys(data).length > 0,
    'At least one field must be provided'
);