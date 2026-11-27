export type AppointmentStatus =
    | 'pending'
    | 'confirmed'
    | 'completed'
    | 'cancelled';

export interface AppointmentRequest {
    petId: string;
    veterinarianId: number;
    availabilityId: number;
    appointmentDate: string;
    reason: string;
}

export interface Appointment extends AppointmentRequest {
    id: number;
    userId: string;
    status: AppointmentStatus;
    createdAt: string;
}

export interface AppointmentStatusRequest {
    status: AppointmentStatus;
}

export interface AppointmentNoteRequest {
    content: string;
}

export interface AppointmentNote extends AppointmentNoteRequest {
    id: number;
    appointmentId: number;
    authorId: string;
    createdAt: string;
}

export interface ActiveAppointmentsResponse {
    hasActiveAppointments: boolean;
}