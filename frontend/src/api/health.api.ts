import api from './axios';
import type {
    Vaccination,
    VaccinationRequest,
    Medication,
    MedicationRequest,
    HealthHistory,
} from '../types/health';

export const healthApi = {
    // Vaccinations

    async getVaccinations(petId: string): Promise<Vaccination[]> {
        const response = await api.get<Vaccination[]>(
            `/pets/${petId}/vaccinations`
        );

        return response.data;
    },

    async getVaccination(id: string): Promise<Vaccination> {
        const response = await api.get<Vaccination>(
            `/vaccinations/${id}`
        );

        return response.data;
    },

    async createVaccination(
        data: VaccinationRequest
    ): Promise<Vaccination> {
        const response = await api.post<Vaccination>(
            '/vaccinations',
            data
        );

        return response.data;
    },

    async updateVaccination(
        id: string,
        data: VaccinationRequest
    ): Promise<Vaccination> {
        const response = await api.put<Vaccination>(
            `/vaccinations/${id}`,
            data
        );

        return response.data;
    },

    async deleteVaccination(id: string): Promise<void> {
        await api.delete(`/vaccinations/${id}`);
    },

    // Medications

    async getMedications(petId: string): Promise<Medication[]> {
        const response = await api.get<Medication[]>(
            `/pets/${petId}/medications`
        );

        return response.data;
    },

    async getMedication(id: string): Promise<Medication> {
        const response = await api.get<Medication>(
            `/medications/${id}`
        );

        return response.data;
    },

    async createMedication(
        data: MedicationRequest
    ): Promise<Medication> {
        const response = await api.post<Medication>(
            '/medications',
            data
        );

        return response.data;
    },

    async updateMedication(
        id: string,
        data: MedicationRequest
    ): Promise<Medication> {
        const response = await api.put<Medication>(
            `/medications/${id}`,
            data
        );

        return response.data;
    },

    async deleteMedication(id: string): Promise<void> {
        await api.delete(`/medications/${id}`);
    },

    // Health History

    async getHealthHistory(petId: string): Promise<HealthHistory> {
        const response = await api.get<HealthHistory>(
            `/pets/${petId}/health-history`
        );

        return response.data;
    },
};