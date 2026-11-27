import api from './axios';
import type {
    Veterinarian,
    VeterinarianRequest,
    Availability,
    AvailabilityRequest,
} from '../types/veterinarian';

export const veterinarianApi = {
    async getVeterinarians(): Promise<Veterinarian[]> {
        const response = await api.get('/veterinarians');
        return response.data;
    },

    async getVeterinarian(id: number): Promise<Veterinarian> {
        const response = await api.get(`/veterinarians/${id}`);
        return response.data;
    },

    async createVeterinarian(
        data: VeterinarianRequest
    ): Promise<Veterinarian> {
        const response = await api.post('/veterinarians', data);
        return response.data;
    },

    async updateVeterinarian(
        id: number,
        data: VeterinarianRequest
    ): Promise<Veterinarian> {
        const response = await api.put(`/veterinarians/${id}`, data);
        return response.data;
    },

    async deleteVeterinarian(id: number): Promise<void> {
        await api.delete(`/veterinarians/${id}`);
    },

    async getAvailability(
        veterinarianId: number
    ): Promise<Availability[]> {
        const response = await api.get(
            `/veterinarians/${veterinarianId}/availability`
        );
        return response.data;
    },

    async createAvailability(
        veterinarianId: number,
        data: AvailabilityRequest
    ): Promise<Availability> {
        const response = await api.post(
            `/veterinarians/${veterinarianId}/availability`,
            data
        );
        return response.data;
    },

    async updateAvailability(
        veterinarianId: number,
        availabilityId: number,
        data: AvailabilityRequest
    ): Promise<Availability> {
        const response = await api.put(
            `/veterinarians/${veterinarianId}/availability/${availabilityId}`,
            data
        );
        return response.data;
    },

    async deleteAvailability(
        veterinarianId: number,
        availabilityId: number
    ): Promise<void> {
        await api.delete(
            `/veterinarians/${veterinarianId}/availability/${availabilityId}`
        );
    },
};