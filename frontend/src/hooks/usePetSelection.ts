import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAuth } from './useAuth';
import { petApi } from '../api/pet.api';
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
                if (isOwner) {
                    const data = await petApi.getPets();

                    if (!active) return;

                    setPets(data);

                    if (requestedPetId) {
                        const pet = data.find(
                            (item) => item.id === requestedPetId
                        );

                        if (!pet) {
                            setError('Pet not found or access denied.');
                            return;
                        }

                        setSelectedPet(pet);
                    } else {
                        setSelectedPet(data[0] || null);
                    }
                } else if (isVeterinarian && requestedPetId) {
                    const pet = await petApi.getPet(requestedPetId);

                    if (!active) return;

                    setSelectedPet(pet);
                }
            } catch (error) {
                if (active) {
                    setError(
                        getApiError(error, 'Failed to load pet information.')
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