import { useState } from 'react';
import type { FormEvent } from 'react';
import { PawPrint, Search } from 'lucide-react';

import type { Pet } from '../types/pet';

interface PetSelectorProps {
    pets: Pet[];
    selectedPet: Pet | null;
    requestedPetId: string;
    loading: boolean;
    error: string;
    isOwner: boolean;
    isVeterinarian: boolean;
    selectPet: (petId: string) => void;
    disabled?: boolean;
}

export default function PetSelector({
    pets,
    selectedPet,
    requestedPetId,
    loading,
    error,
    isOwner,
    isVeterinarian,
    selectPet,
    disabled = false,
}: PetSelectorProps) {
    const [searchId, setSearchId] = useState(requestedPetId);

    const handleSearch = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (searchId.trim()) {
            selectPet(searchId.trim());
        }
    };

    return (
        <section className="pet-selector">
            <div className="pet-selector-heading">
                <div className="pet-selector-icon">
                    <PawPrint size={25} />
                </div>

                <div>
                    <h2>Select pet</h2>

                    <p>
                        Choose a pet to view its health records.
                    </p>
                </div>
            </div>

            {isOwner && (
                <div className="edit-form-group">
                    <label htmlFor="selected-pet">
                        Your pets
                    </label>

                    <select
                        id="selected-pet"
                        value={selectedPet?.id || ''}
                        onChange={(event) =>
                            selectPet(event.target.value)
                        }
                        disabled={
                            loading ||
                            disabled ||
                            pets.length === 0
                        }
                    >
                        <option value="" disabled>
                            Select a pet
                        </option>

                        {pets.map((pet) => (
                            <option
                                key={pet.id}
                                value={pet.id}
                            >
                                {pet.name} – {pet.species}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {isVeterinarian && (
                <form
                    className="pet-selector-search"
                    onSubmit={handleSearch}
                >
                    <div className="edit-form-group">
                        <label htmlFor="patient-id">
                            Patient ID
                        </label>

                        <input
                            id="patient-id"
                            type="text"
                            value={searchId}
                            onChange={(event) =>
                                setSearchId(event.target.value)
                            }
                            placeholder="Enter pet UUID"
                            disabled={loading || disabled}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={
                            loading ||
                            disabled ||
                            !searchId.trim()
                        }
                    >
                        <Search size={18} />
                        Find pet
                    </button>
                </form>
            )}

            {loading && (
                <p className="pet-selector-message">
                    Loading pet information...
                </p>
            )}

            {error && (
                <div className="auth-error">{error}</div>
            )}

            {!loading &&
                !error &&
                isOwner &&
                pets.length === 0 && (
                    <p className="pet-selector-message">
                        You have no pets yet. Add a pet in My Pets.
                    </p>
                )}

            {!loading && selectedPet && (
                <div className="selected-pet-info">
                    <div className="selected-pet-avatar">
                        {selectedPet.imageUrl ? (
                            <img
                                src={selectedPet.imageUrl}
                                alt={selectedPet.name}
                            />
                        ) : (
                            <PawPrint size={25} />
                        )}
                    </div>

                    <div>
                        <strong>{selectedPet.name}</strong>

                        <p>
                            {selectedPet.species}
                            {' · '}
                            {selectedPet.breed || 'Unknown breed'}
                        </p>
                    </div>

                    <span className="selected-pet-label">
                        Selected
                    </span>
                </div>
            )}
        </section>
    );
}