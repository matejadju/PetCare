import api from './axios';
import type {
    Appointment,
    AppointmentRequest,
    AppointmentStatus,
    AppointmentNote,
    AppointmentNoteRequest,
    ActiveAppointmentsResponse,
} from '../types/appointment';

export const appointmentApi = {
    async getAppointments(): Promise<Appointment[]> {
        const response = await api.get('/appointments');
        return response.data;
    },

    async getAppointment(id: number): Promise<Appointment> {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    },

    async createAppointment(
        data: AppointmentRequest
    ): Promise<Appointment> {
        const response = await api.post('/appointments', data);
        return response.data;
    },

    async updateAppointment(
        id: number,
        data: AppointmentRequest
    ): Promise<Appointment> {
        const response = await api.put(`/appointments/${id}`, data);
        return response.data;
    },

    async deleteAppointment(id: number): Promise<void> {
        await api.delete(`/appointments/${id}`);
    },

    async updateStatus(
        id: number,
        status: AppointmentStatus
    ): Promise<Appointment> {
        const response = await api.put(
            `/appointments/${id}/status`,
            { status }
        );
        return response.data;
    },

    async getNotes(
        appointmentId: number
    ): Promise<AppointmentNote[]> {
        const response = await api.get(
            `/appointments/${appointmentId}/notes`
        );
        return response.data;
    },

    async createNote(
        appointmentId: number,
        data: AppointmentNoteRequest
    ): Promise<AppointmentNote> {
        const response = await api.post(
            `/appointments/${appointmentId}/notes`,
            data
        );
        return response.data;
    },

    async deleteNote(
        appointmentId: number,
        noteId: number
    ): Promise<void> {
        await api.delete(
            `/appointments/${appointmentId}/notes/${noteId}`
        );
    },

    async hasActivePetAppointments(
        petId: string
    ): Promise<boolean> {
        const response = await api.get<ActiveAppointmentsResponse>(
            `/appointments/pets/${petId}/active`
        );
        return response.data.hasActiveAppointments;
    },

    async hasActiveUserAppointments(
        userId: string
    ): Promise<boolean> {
        const response = await api.get<ActiveAppointmentsResponse>(
            `/appointments/users/${userId}/active`
        );
        return response.data.hasActiveAppointments;
    },
};