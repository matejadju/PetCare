import { PawPrint } from 'lucide-react';
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
    loading,
    error,
    isOwner,
    isVeterinarian,
    selectPet,
    disabled = false,
}: PetSelectorProps) {
    return (
        <section className="pet-selector">
            <div className="pet-selector-heading">
                <div className="pet-selector-icon">
                    <PawPrint size={25} />
                </div>

                <div>
                    <h2>
                        {isVeterinarian
                            ? 'Select patient'
                            : 'Select pet'}
                    </h2>

                    <p>
                        {isVeterinarian
                            ? 'Choose a patient from your appointments to manage health records.'
                            : 'Choose a pet to view its health records.'}
                    </p>
                </div>
            </div>

            {(isOwner || isVeterinarian) && (
                <div className="edit-form-group">
                    <label htmlFor="selected-pet">
                        {isVeterinarian
                            ? 'Your patients'
                            : 'Your pets'}
                    </label>

                    <select
                        id="selected-pet"
                        value={selectedPet?.id || ''}
                        onChange={event =>
                            selectPet(event.target.value)
                        }
                        disabled={
                            loading ||
                            disabled ||
                            pets.length === 0
                        }
                    >
                        <option value="" disabled>
                            {isVeterinarian
                                ? 'Select a patient'
                                : 'Select a pet'}
                        </option>

                        {pets.map(pet => (
                            <option
                                key={pet.id}
                                value={pet.id}
                            >
                                {pet.name} - {pet.species}
                                {pet.breed
                                    ? ` (${pet.breed})`
                                    : ''}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {loading && (
                <p className="pet-selector-message">
                    {isVeterinarian
                        ? 'Loading patients...'
                        : 'Loading pet information...'}
                </p>
            )}

            {error && (
                <div className="auth-error">
                    {error}
                </div>
            )}

            {!loading &&
                !error &&
                pets.length === 0 && (
                    <p className="pet-selector-message">
                        {isVeterinarian
                            ? 'You have no patients from appointments yet.'
                            : 'You have no pets yet. Add a pet in My Pets.'}
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
                        <strong>
                            {selectedPet.name}
                        </strong>

                        <p>
                            {selectedPet.species}
                            {' / '}
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