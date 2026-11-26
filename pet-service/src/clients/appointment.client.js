import 'dotenv/config';

const BASE_URL = (
    process.env.APPOINTMENT_SERVICE_URL
    || 'http://localhost:8004'
).replace(/\/+$/, '');

const TIMEOUT_MS = Number(
    process.env.APPOINTMENT_SERVICE_TIMEOUT_MS || 5000
);

function createError(message, status, code) {
    const error = new Error(message);

    error.status = status;
    error.code = code;

    return error;
}

async function checkActiveAppointments(
    path,
    authorization
) {
    let response;

    try {
        response = await fetch(`${BASE_URL}${path}`, {
            method: 'GET',

            headers: {
                Authorization: authorization,
                Accept: 'application/json'
            },

            signal: AbortSignal.timeout(TIMEOUT_MS),

            redirect: 'error'
        });

    } catch (error) {
        if (error.name === 'TimeoutError') {
            throw createError(
                'Appointment Service request timed out',
                504,
                'APPOINTMENT_SERVICE_TIMEOUT'
            );
        }

        throw createError(
            'Appointment Service is unavailable',
            503,
            'APPOINTMENT_SERVICE_UNAVAILABLE'
        );
    }

    if (response.status === 401) {
        throw createError(
            'Appointment Service rejected the JWT token',
            401,
            'APPOINTMENT_TOKEN_REJECTED'
        );
    }

    if (response.status === 403) {
        throw createError(
            'Appointment Service denied access',
            403,
            'APPOINTMENT_ACCESS_DENIED'
        );
    }

    if (!response.ok) {
        throw createError(
            'Appointment Service returned an error',
            502,
            'APPOINTMENT_SERVICE_ERROR'
        );
    }

    let data;

    try {
        data = await response.json();

    } catch (error) {
        if (
            error.name === 'AbortError' ||
            error.name === 'TimeoutError'
        ) {
            throw createError(
                'Appointment Service request timed out',
                504,
                'APPOINTMENT_SERVICE_TIMEOUT'
            );
        }

        throw createError(
            'Invalid response from Appointment Service',
            502,
            'APPOINTMENT_INVALID_RESPONSE'
        );
    }

    if (typeof data?.hasActiveAppointments !== 'boolean') {
        throw createError(
            'Invalid appointment response format',
            502,
            'APPOINTMENT_INVALID_RESPONSE'
        );
    }

    return data.hasActiveAppointments;
}

export async function hasActiveUserAppointments(
    userId,
    authorization
) {
    return checkActiveAppointments(
        `/appointments/users/${encodeURIComponent(userId)}/active`,
        authorization
    );
}

export async function hasActivePetAppointments(
    petId,
    authorization
) {
    return checkActiveAppointments(
        `/appointments/pets/${encodeURIComponent(petId)}/active`,
        authorization
    );
}