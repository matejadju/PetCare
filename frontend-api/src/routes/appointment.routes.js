import { Router } from 'express';
import {
    forwardAppointmentRequest,
} from '../services/appointment.service.js';

const router = Router();

// Appointments
router.get('/appointments', forwardAppointmentRequest);
router.post('/appointments', forwardAppointmentRequest);

// Active appointments
router.get(
    '/appointments/pets/:petId/active',
    forwardAppointmentRequest
);

router.get(
    '/appointments/users/:userId/active',
    forwardAppointmentRequest
);

// Appointment details
router.get('/appointments/:id', forwardAppointmentRequest);
router.put('/appointments/:id', forwardAppointmentRequest);
router.delete('/appointments/:id', forwardAppointmentRequest);

// Appointment status
router.put(
    '/appointments/:id/status',
    forwardAppointmentRequest
);

// Appointment notes
router.get(
    '/appointments/:id/notes',
    forwardAppointmentRequest
);

router.post(
    '/appointments/:id/notes',
    forwardAppointmentRequest
);

router.delete(
    '/appointments/:id/notes/:noteId',
    forwardAppointmentRequest
);

export default router;