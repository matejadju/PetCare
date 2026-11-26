export type PetGender = 'MALE' | 'FEMALE' | 'UNKNOWN';

export interface Pet {
    id: string;
    ownerId: string;
    name: string;
    species: string;
    breed: string | null;
    birthDate: string | null;
    gender: PetGender;
    imageUrl: string | null;
    createdAt: string;
    updatedAt: string;
    weight: number | null;
}

export interface PetRequest {
    name: string;
    species: string;
    breed?: string | null;
    birthDate?: string | null;
    gender: PetGender;
    imageUrl?: string | null;
}

export interface PetResponse {
    message: string;
    pet: Pet;
}

export interface PetWeight {
    id: string;
    petId: string;
    weight: number;
    measuredAt: string;
    createdAt: string;
}

export interface WeightRequest {
    weight: number;
    measuredAt?: string;
}

export interface WeightResponse {
    message: string;
    measurement: PetWeight;
}