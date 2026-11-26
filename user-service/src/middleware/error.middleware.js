import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof ZodError) {
        return res.status(400).json({
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            errors: err.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }))
        });
    }

    if (err.code === 'P2002') {
        return res.status(409).json({
            code: 'DUPLICATE_RESOURCE',
            message: 'Resource already exists'
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            code: 'RESOURCE_NOT_FOUND',
            message: 'Requested resource was not found'
        });
    }

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            code: 'INVALID_JSON',
            message: 'Invalid JSON request body'
        });
    }

    if (err.status && err.status >= 400 && err.status < 500) {
        return res.status(err.status).json({
            code: err.code || 'REQUEST_ERROR',
            message: err.message
        });
    }

    console.error(err);

    return res.status(500).json({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
    });
}