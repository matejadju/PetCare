export interface VaccinationRequest {
    pet_id: string;
    veterinarian_id: string;
    vaccine_name: string;
    vaccination_date: string;
    next_due_date?: string | null;
    notes?: string | null;
}

export interface Vaccination extends VaccinationRequest {
    id: string;
    next_due_date: string | null;
    notes: string | null;
    created_at: string;
}

export interface MedicationRequest {
    pet_id: string;
    veterinarian_id: string;
    medication_name: string;
    dosage: string;
    start_date: string;
    end_date?: string | null;
    instructions?: string | null;
}

export interface Medication extends MedicationRequest {
    id: string;
    end_date: string | null;
    instructions: string | null;
    created_at: string;
}

export interface HealthHistory {
    pet_id: string;
    vaccinations: Vaccination[];
    medications: Medication[];
}