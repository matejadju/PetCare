import { useState } from 'react';
import type { FormEvent } from 'react';
import { Save, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { healthApi } from '../api/health.api';
import { getApiError } from '../utils/apiError';
import type { Vaccination } from '../types/health';

interface VaccinationFormProps {
    petId: string;
    vaccination?: Vaccination;
    onClose: () => void;
    onSaved: (vaccination: Vaccination) => void;
}

export default function VaccinationForm({
    petId,
    vaccination,
    onClose,
    onSaved,
}: VaccinationFormProps) {
    const { user } = useAuth();

    const [vaccineName, setVaccineName] = useState(
        vaccination?.vaccine_name || ''
    );

    const [vaccinationDate, setVaccinationDate] = useState(
        vaccination?.vaccination_date || ''
    );

    const [nextDueDate, setNextDueDate] = useState(
        vaccination?.next_due_date || ''
    );

    const [notes, setNotes] = useState(
        vaccination?.notes || ''
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user || user.role !== 'VETERINARIAN' || loading) {
            return;
        }

        setError('');

        if (!vaccineName.trim()) {
            setError('Vaccine name is required.');
            return;
        }

        if (nextDueDate && nextDueDate < vaccinationDate) {
            setError(
                'Next due date cannot be before vaccination date.'
            );
            return;
        }

        setLoading(true);

        const data = {
            pet_id: petId,
            veterinarian_id: user.id,
            vaccine_name: vaccineName.trim(),
            vaccination_date: vaccinationDate,
            next_due_date: nextDueDate || null,
            notes: notes.trim() || null,
        };

        try {
            const savedVaccination = vaccination
                ? await healthApi.updateVaccination(
                    vaccination.id,
                    data
                )
                : await healthApi.createVaccination(data);

            onSaved(savedVaccination);
            onClose();
        } catch (error) {
            setError(
                getApiError(error, 'Failed to save vaccination.')
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="health-form-card">
            <div className="profile-card-header">
                <h2>
                    {vaccination
                        ? 'Edit vaccination'
                        : 'Add vaccination'}
                </h2>

                <button
                    type="button"
                    className="icon-button"
                    onClick={onClose}
                    disabled={loading}
                    aria-label="Close vaccination form"
                >
                    <X size={22} />
                </button>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="edit-form-grid">
                    <div className="edit-form-group">
                        <label htmlFor="vaccine-name">
                            Vaccine name
                        </label>

                        <input
                            id="vaccine-name"
                            value={vaccineName}
                            onChange={(e) =>
                                setVaccineName(e.target.value)
                            }
                            placeholder="e.g. Rabies"
                            maxLength={150}
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="vaccination-pet">
                            Pet ID
                        </label>

                        <input
                            id="vaccination-pet"
                            value={petId}
                            disabled
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="vaccination-date">
                            Vaccination date
                        </label>

                        <input
                            id="vaccination-date"
                            type="date"
                            value={vaccinationDate}
                            onChange={(e) =>
                                setVaccinationDate(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="next-due-date">
                            Next due date
                        </label>

                        <input
                            id="next-due-date"
                            type="date"
                            value={nextDueDate}
                            min={vaccinationDate || undefined}
                            onChange={(e) =>
                                setNextDueDate(e.target.value)
                            }
                        />
                    </div>

                    <div className="edit-form-group health-full-width">
                        <label htmlFor="vaccination-notes">
                            Notes
                        </label>

                        <textarea
                            id="vaccination-notes"
                            value={notes}
                            onChange={(e) =>
                                setNotes(e.target.value)
                            }
                            placeholder="Additional information..."
                            rows={4}
                        />
                    </div>
                </div>

                <div className="profile-actions">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save vaccination'}
                    </button>
                </div>
            </form>
        </section>
    );
}