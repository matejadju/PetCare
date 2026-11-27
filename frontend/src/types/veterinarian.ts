export interface VeterinarianRequest {
    firstName: string;
    lastName: string;
    specialization: string;
    clinicName: string;
    address: string;
    phone: string;
    description: string;
}

export interface Veterinarian extends VeterinarianRequest {
    id: number;
    userId: string;
}

export interface AvailabilityRequest {
    date: string;
    startTime: string;
    endTime: string;
}

export interface Availability extends AvailabilityRequest {
    id: number;
    veterinarianId: number;
}