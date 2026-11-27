import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAuth } from './useAuth';
import { petApi } from '../api/pet.api';
import { appointmentApi } from '../api/appointment.api';
import { getApiError } from '../utils/apiError';
import type { Pet } from '../types/pet';

export function usePetSelection() {
    const { user } = useAuth();

    const [searchParams, setSearchParams] = useSearchParams();

    const requestedPetId = searchParams.get('petId') || '';

    const [pets, setPets] = useState<Pet[]>([]);
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isOwner = user?.role === 'OWNER';
    const isVeterinarian = user?.role === 'VETERINARIAN';

    useEffect(() => {
        let active = true;

        const loadPets = async () => {
            setLoading(true);
            setError('');
            setSelectedPet(null);
            setPets([]);

            try {
                let data: Pet[] = [];

                if (isOwner) {
                    data = await petApi.getPets();
                } else if (isVeterinarian) {
                    const appointments =
                        await appointmentApi.getAppointments();

                    const patientIds = [
                        ...new Set(
                            appointments
                                .filter(
                                    appointment =>
                                        appointment.status !== 'cancelled'
                                )
                                .map(
                                    appointment => appointment.petId
                                )
                        ),
                    ];

                    const results = await Promise.allSettled(
                        patientIds.map(
                            petId => petApi.getPet(petId)
                        )
                    );

                    data = results
                        .filter(
                            (
                                result
                            ): result is PromiseFulfilledResult<Pet> =>
                                result.status === 'fulfilled'
                        )
                        .map(result => result.value);

                    data.sort((a, b) =>
                        a.name.localeCompare(b.name)
                    );

                    if (
                        active &&
                        results.some(
                            result => result.status === 'rejected'
                        )
                    ) {
                        setError(
                            'Some patient information could not be loaded.'
                        );
                    }
                }

                if (!active) return;

                setPets(data);

                if (requestedPetId) {
                    const pet = data.find(
                        item => item.id === requestedPetId
                    );

                    if (!pet) {
                        setError(
                            'Pet not found in your available patient list.'
                        );
                        return;
                    }

                    setSelectedPet(pet);
                } else {
                    setSelectedPet(data[0] || null);
                }
            } catch (error) {
                if (active) {
                    setError(
                        getApiError(
                            error,
                            'Failed to load pet information.'
                        )
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadPets();

        return () => {
            active = false;
        };
    }, [
        isOwner,
        isVeterinarian,
        requestedPetId,
        user?.id,
    ]);

    const selectPet = (petId: string) => {
        const params = new URLSearchParams(searchParams);

        if (petId) {
            params.set('petId', petId.trim());
        } else {
            params.delete('petId');
        }

        setSearchParams(params);
    };

    return {
        pets,
        selectedPet,
        petId: selectedPet?.id || '',
        requestedPetId,
        loading,
        error,
        isOwner,
        isVeterinarian,
        selectPet,
    };
}