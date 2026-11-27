import { useState } from 'react';
import type { FormEvent } from 'react';
import { Save, X } from 'lucide-react';
import { petApi } from '../api/pet.api';
import { getApiError } from '../utils/apiError';
import type { Pet, PetGender, PetRequest } from '../types/pet';

interface PetFormProps {
    pet?: Pet;
    onClose: () => void;
    onSaved: (pet: Pet) => void;
}

export default function PetForm({
    pet,
    onClose,
    onSaved,
}: PetFormProps) {
    const [name, setName] = useState(pet?.name || '');
    const [species, setSpecies] = useState(pet?.species || '');
    const [breed, setBreed] = useState(pet?.breed || '');

    const [birthDate, setBirthDate] = useState(
        pet?.birthDate?.slice(0, 10) || ''
    );

    const [gender, setGender] = useState<PetGender>(
        pet?.gender || 'UNKNOWN'
    );

    const [imageUrl, setImageUrl] = useState(pet?.imageUrl || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const today = new Date().toLocaleDateString('en-CA');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (!name.trim() || !species.trim()) {
            setError('Pet name and species are required.');
            return;
        }

        if (birthDate && birthDate > today) {
            setError('Birth date cannot be in the future.');
            return;
        }

        if (imageUrl.trim()) {
            try {
                const url = new URL(imageUrl.trim());

                if (url.protocol !== 'https:') {
                    throw new Error('Invalid protocol');
                }
            } catch {
                setError('Please enter a valid HTTPS image URL.');
                return;
            }
        }

        const data: PetRequest = {
            name: name.trim(),
            species: species.trim(),
            breed: breed.trim() || null,
            birthDate: birthDate || null,
            gender,
            imageUrl: imageUrl.trim() || null,
        };

        setLoading(true);

        try {
            const savedPet = pet
                ? await petApi.updatePet(pet.id, data)
                : await petApi.createPet(data);

            onSaved(savedPet);
            onClose();
        } catch (error) {
            setError(
                getApiError(error, 'Failed to save pet.')
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="health-form-card">
            <div className="profile-card-header">
                <h2>{pet ? 'Edit pet' : 'Add new pet'}</h2>

                <button
                    type="button"
                    className="icon-button"
                    onClick={onClose}
                    disabled={loading}
                    aria-label="Close form"
                >
                    <X size={21} />
                </button>
            </div>

            {error && (
                <div className="auth-error">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="edit-form-grid">
                    <div className="edit-form-group">
                        <label htmlFor="pet-name">Pet name</label>

                        <input
                            id="pet-name"
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="e.g. Luna"
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="pet-species">Species</label>

                        <input
                            id="pet-species"
                            type="text"
                            value={species}
                            onChange={(event) =>
                                setSpecies(event.target.value)
                            }
                            placeholder="e.g. Dog"
                            maxLength={50}
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="pet-breed">Breed</label>

                        <input
                            id="pet-breed"
                            type="text"
                            value={breed}
                            onChange={(event) =>
                                setBreed(event.target.value)
                            }
                            placeholder="e.g. Golden Retriever"
                            maxLength={100}
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="pet-birth-date">
                            Birth date
                        </label>

                        <input
                            id="pet-birth-date"
                            type="date"
                            value={birthDate}
                            max={today}
                            onChange={(event) =>
                                setBirthDate(event.target.value)
                            }
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="pet-gender">Gender</label>

                        <select
                            id="pet-gender"
                            value={gender}
                            onChange={(event) =>
                                setGender(
                                    event.target.value as PetGender
                                )
                            }
                        >
                            <option value="UNKNOWN">Unknown</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                        </select>
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="pet-image">
                            Image URL (optional)
                        </label>

                        <input
                            id="pet-image"
                            type="url"
                            value={imageUrl}
                            onChange={(event) =>
                                setImageUrl(event.target.value)
                            }
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div className="profile-actions">
                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save pet'}
                    </button>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </section>
    );
}