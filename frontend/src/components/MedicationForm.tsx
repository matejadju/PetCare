import { useState } from 'react';
import type { FormEvent } from 'react';
import { Save, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { healthApi } from '../api/health.api';
import { getApiError } from '../utils/apiError';
import type { Medication } from '../types/health';

interface MedicationFormProps {
    petId: string;
    medication?: Medication;
    onClose: () => void;
    onSaved: (medication: Medication) => void;
}

export default function MedicationForm({
    petId,
    medication,
    onClose,
    onSaved,
}: MedicationFormProps) {
    const { user } = useAuth();

    const [medicationName, setMedicationName] = useState(
        medication?.medication_name || ''
    );

    const [dosage, setDosage] = useState(
        medication?.dosage || ''
    );

    const [startDate, setStartDate] = useState(
        medication?.start_date || ''
    );

    const [endDate, setEndDate] = useState(
        medication?.end_date || ''
    );

    const [instructions, setInstructions] = useState(
        medication?.instructions || ''
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user || user.role !== 'VETERINARIAN' || loading) {
            return;
        }

        setError('');

        if (!medicationName.trim() || !dosage.trim()) {
            setError('Medication name and dosage are required.');
            return;
        }

        if (endDate && endDate < startDate) {
            setError('End date cannot be before start date.');
            return;
        }

        setLoading(true);

        const data = {
            pet_id: petId,
            veterinarian_id: user.id,
            medication_name: medicationName.trim(),
            dosage: dosage.trim(),
            start_date: startDate,
            end_date: endDate || null,
            instructions: instructions.trim() || null,
        };

        try {
            const savedMedication = medication
                ? await healthApi.updateMedication(
                    medication.id,
                    data
                )
                : await healthApi.createMedication(data);

            onSaved(savedMedication);
            onClose();
        } catch (error) {
            setError(
                getApiError(error, 'Failed to save medication.')
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="health-form-card">
            <div className="profile-card-header">
                <h2>
                    {medication
                        ? 'Edit medication'
                        : 'Add medication'}
                </h2>

                <button
                    type="button"
                    className="icon-button"
                    onClick={onClose}
                    disabled={loading}
                    aria-label="Close medication form"
                >
                    <X size={22} />
                </button>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="edit-form-grid">
                    <div className="edit-form-group">
                        <label htmlFor="medication-name">
                            Medication name
                        </label>

                        <input
                            id="medication-name"
                            value={medicationName}
                            onChange={(e) =>
                                setMedicationName(e.target.value)
                            }
                            placeholder="Enter medication name"
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="medication-pet">
                            Pet ID
                        </label>

                        <input
                            id="medication-pet"
                            value={petId}
                            disabled
                        />
                    </div>

                    <div className="edit-form-group health-full-width">
                        <label htmlFor="medication-dosage">
                            Dosage
                        </label>

                        <input
                            id="medication-dosage"
                            value={dosage}
                            onChange={(e) =>
                                setDosage(e.target.value)
                            }
                            placeholder="Enter prescribed dosage"
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="medication-start">
                            Start date
                        </label>

                        <input
                            id="medication-start"
                            type="date"
                            value={startDate}
                            onChange={(e) =>
                                setStartDate(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="medication-end">
                            End date
                        </label>

                        <input
                            id="medication-end"
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            onChange={(e) =>
                                setEndDate(e.target.value)
                            }
                        />
                    </div>

                    <div className="edit-form-group health-full-width">
                        <label htmlFor="medication-instructions">
                            Instructions
                        </label>

                        <textarea
                            id="medication-instructions"
                            value={instructions}
                            onChange={(e) =>
                                setInstructions(e.target.value)
                            }
                            placeholder="Additional instructions..."
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
                        {loading ? 'Saving...' : 'Save medication'}
                    </button>
                </div>
            </form>
        </section>
    );
}