import api from './axios';

import type {
    Pet,
    PetRequest,
    PetResponse,
    PetWeight,
    WeightRequest,
    WeightResponse,
} from '../types/pet';

export const petApi = {
    async getPets(): Promise<Pet[]> {
        const response = await api.get<Pet[]>('/pets');

        return response.data;
    },

    async getPet(id: string): Promise<Pet> {
        const response = await api.get<Pet>(`/pets/${id}`);

        return response.data;
    },

    async createPet(data: PetRequest): Promise<Pet> {
        const response = await api.post<PetResponse>(
            '/pets',
            data
        );

        return response.data.pet;
    },

    async updatePet(id: string, data: PetRequest): Promise<Pet> {
        const response = await api.put<PetResponse>(
            `/pets/${id}`,
            data
        );

        return response.data.pet;
    },

    async deletePet(id: string): Promise<void> {
        await api.delete(`/pets/${id}`);
    },

    async getWeights(petId: string): Promise<PetWeight[]> {
        const response = await api.get<PetWeight[]>(
            `/pets/${petId}/weights`
        );

        return response.data;
    },

    async createWeight(
        petId: string,
        data: WeightRequest
    ): Promise<PetWeight> {
        const response = await api.post<WeightResponse>(
            `/pets/${petId}/weights`,
            data
        );

        return response.data.measurement;
    },

    async updateWeight(
        petId: string,
        weightId: string,
        data: WeightRequest
    ): Promise<PetWeight> {
        const response = await api.put<WeightResponse>(
            `/pets/${petId}/weights/${weightId}`,
            data
        );

        return response.data.measurement;
    },

    async deleteWeight(
        petId: string,
        weightId: string
    ): Promise<void> {
        await api.delete(
            `/pets/${petId}/weights/${weightId}`
        );
    },
};