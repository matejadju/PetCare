import { useState } from 'react';
import type { FormEvent } from 'react';
import { Save, X } from 'lucide-react';
import { veterinarianApi } from '../api/veterinarian.api';
import { getApiError } from '../utils/apiError';
import type {
    Availability,
    AvailabilityRequest,
} from '../types/veterinarian';

interface AvailabilityFormProps {
    veterinarianId: number;
    availability?: Availability;
    onClose: () => void;
    onSaved: (availability: Availability) => void;
}

export default function AvailabilityForm({
    veterinarianId,
    availability,
    onClose,
    onSaved,
}: AvailabilityFormProps) {
    const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Ljubljana',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());

    const [date, setDate] = useState(
        availability?.date || today
    );

    const [startTime, setStartTime] = useState(
        availability?.startTime.slice(0, 5) || '09:00'
    );

    const [endTime, setEndTime] = useState(
        availability?.endTime.slice(0, 5) || '09:30'
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');

        if (!date || !startTime || !endTime) {
            setError('Please complete all fields.');
            return;
        }

        if (date < today) {
            setError('Availability cannot be scheduled in the past.');
            return;
        }

        if (endTime <= startTime) {
            setError('End time must be after start time.');
            return;
        }

        const data: AvailabilityRequest = {
            date,
            startTime: `${startTime}:00`,
            endTime: `${endTime}:00`,
        };

        try {
            setLoading(true);

            const saved = availability
                ? await veterinarianApi.updateAvailability(
                    veterinarianId,
                    availability.id,
                    data
                )
                : await veterinarianApi.createAvailability(
                    veterinarianId,
                    data
                );

            onSaved(saved);
            onClose();
        } catch (error) {
            setError(
                getApiError(error, 'Failed to save availability.')
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="health-form-card">
            <div className="profile-card-header">
                <h2>
                    {availability
                        ? 'Edit availability'
                        : 'Add availability'}
                </h2>

                <button
                    type="button"
                    className="icon-button"
                    onClick={onClose}
                    disabled={loading}
                    aria-label="Close form"
                >
                    <X size={20} />
                </button>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="edit-form-grid">
                    <div className="edit-form-group">
                        <label htmlFor="availability-date">Date *</label>
                        <input
                            id="availability-date"
                            type="date"
                            value={date}
                            min={today}
                            onChange={event => setDate(event.target.value)}
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="availability-start">
                            Start time *
                        </label>
                        <input
                            id="availability-start"
                            type="time"
                            value={startTime}
                            onChange={event =>
                                setStartTime(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="availability-end">
                            End time *
                        </label>
                        <input
                            id="availability-end"
                            type="time"
                            value={endTime}
                            onChange={event =>
                                setEndTime(event.target.value)
                            }
                            required
                        />
                    </div>
                </div>

                <p className="availability-hint">
                    Each availability slot represents one appointment.
                    All times are in the Europe/Ljubljana time zone.
                </p>

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
                        {loading ? 'Saving...' : 'Save availability'}
                    </button>
                </div>
            </form>
        </section>
    );
}