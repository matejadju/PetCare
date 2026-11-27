import { useState } from 'react';
import type { FormEvent } from 'react';
import { Save, X } from 'lucide-react';

import { petApi } from '../api/pet.api';
import { getApiError } from '../utils/apiError';
import type { PetWeight, WeightRequest } from '../types/pet';

interface WeightFormProps {
    petId: string;
    measurement?: PetWeight;
    onClose: () => void;
    onSaved: (measurement: PetWeight) => void;
}

function formatLocalDateTime(date: Date) {
    const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
    );

    return localDate.toISOString().slice(0, 16);
}

export default function WeightForm({
    petId,
    measurement,
    onClose,
    onSaved,
}: WeightFormProps) {
    const [weight, setWeight] = useState(
        measurement ? String(measurement.weight) : ''
    );

    const [measuredAt, setMeasuredAt] = useState(
        formatLocalDateTime(
            measurement
                ? new Date(measurement.measuredAt)
                : new Date()
        )
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError('');

        const numericWeight = Number(weight);

        if (
            !Number.isFinite(numericWeight) ||
            numericWeight <= 0 ||
            numericWeight > 9999.999
        ) {
            setError('Please enter a valid weight.');
            return;
        }

        const measurementDate = new Date(measuredAt);

        if (Number.isNaN(measurementDate.getTime())) {
            setError('Please enter a valid measurement date.');
            return;
        }

        if (measurementDate.getTime() > Date.now()) {
            setError('Measurement date cannot be in the future.');
            return;
        }

        const data: WeightRequest = {
            weight: numericWeight,
            measuredAt: measurementDate.toISOString(),
        };

        setLoading(true);

        try {
            const savedMeasurement = measurement
                ? await petApi.updateWeight(
                    petId,
                    measurement.id,
                    data
                )
                : await petApi.createWeight(petId, data);

            onSaved(savedMeasurement);
            onClose();
        } catch (error) {
            setError(
                getApiError(
                    error,
                    'Failed to save weight measurement.'
                )
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="health-form-card">
            <div className="profile-card-header">
                <h2>
                    {measurement
                        ? 'Edit weight measurement'
                        : 'Add weight measurement'}
                </h2>

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
                        <label htmlFor="pet-weight">
                            Weight (kg)
                        </label>

                        <input
                            id="pet-weight"
                            type="number"
                            min="0.001"
                            max="9999.999"
                            step="0.001"
                            value={weight}
                            onChange={(event) =>
                                setWeight(event.target.value)
                            }
                            placeholder="e.g. 28.5"
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="measured-at">
                            Measurement date and time
                        </label>

                        <input
                            id="measured-at"
                            type="datetime-local"
                            value={measuredAt}
                            max={formatLocalDateTime(new Date())}
                            onChange={(event) =>
                                setMeasuredAt(event.target.value)
                            }
                            required
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
                        {loading ? 'Saving...' : 'Save measurement'}
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