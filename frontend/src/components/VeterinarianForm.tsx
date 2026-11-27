import { useState } from 'react';
import type { FormEvent } from 'react';
import { Save, X } from 'lucide-react';
import { veterinarianApi } from '../api/veterinarian.api';
import { getApiError } from '../utils/apiError';
import type {
    Veterinarian,
    VeterinarianRequest,
} from '../types/veterinarian';

interface VeterinarianFormProps {
    veterinarian?: Veterinarian;
    onClose: () => void;
    onSaved: (veterinarian: Veterinarian) => void;
}

export default function VeterinarianForm({
    veterinarian,
    onClose,
    onSaved,
}: VeterinarianFormProps) {
    const [form, setForm] = useState<VeterinarianRequest>({
        firstName: veterinarian?.firstName || '',
        lastName: veterinarian?.lastName || '',
        specialization: veterinarian?.specialization || '',
        clinicName: veterinarian?.clinicName || '',
        address: veterinarian?.address || '',
        phone: veterinarian?.phone || '',
        description: veterinarian?.description || '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    function updateField(
        field: keyof VeterinarianRequest,
        value: string
    ) {
        setForm(previous => ({
            ...previous,
            [field]: value,
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');

        const data: VeterinarianRequest = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            specialization: form.specialization.trim(),
            clinicName: form.clinicName.trim(),
            address: form.address.trim(),
            phone: form.phone.trim(),
            description: form.description.trim(),
        };

        if (
            !data.firstName ||
            !data.lastName ||
            !data.specialization ||
            !data.clinicName ||
            !data.address
        ) {
            setError('Please complete all required fields.');
            return;
        }

        try {
            setLoading(true);

            const saved = veterinarian
                ? await veterinarianApi.updateVeterinarian(
                    veterinarian.id,
                    data
                )
                : await veterinarianApi.createVeterinarian(data);

            onSaved(saved);
            onClose();
        } catch (error) {
            setError(
                getApiError(error, 'Failed to save veterinarian profile.')
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="health-form-card">
            <div className="profile-card-header">
                <h2>
                    {veterinarian
                        ? 'Edit professional profile'
                        : 'Create professional profile'}
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
                        <label htmlFor="vet-first-name">First name *</label>
                        <input
                            id="vet-first-name"
                            value={form.firstName}
                            onChange={event =>
                                updateField('firstName', event.target.value)
                            }
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="vet-last-name">Last name *</label>
                        <input
                            id="vet-last-name"
                            value={form.lastName}
                            onChange={event =>
                                updateField('lastName', event.target.value)
                            }
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="vet-specialization">
                            Specialization *
                        </label>
                        <input
                            id="vet-specialization"
                            value={form.specialization}
                            onChange={event =>
                                updateField(
                                    'specialization',
                                    event.target.value
                                )
                            }
                            maxLength={150}
                            placeholder="Small Animal Medicine"
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="vet-clinic">Clinic name *</label>
                        <input
                            id="vet-clinic"
                            value={form.clinicName}
                            onChange={event =>
                                updateField('clinicName', event.target.value)
                            }
                            maxLength={200}
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="vet-address">Address *</label>
                        <input
                            id="vet-address"
                            value={form.address}
                            onChange={event =>
                                updateField('address', event.target.value)
                            }
                            maxLength={250}
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="vet-phone">Phone</label>
                        <input
                            id="vet-phone"
                            type="tel"
                            value={form.phone}
                            onChange={event =>
                                updateField('phone', event.target.value)
                            }
                            maxLength={30}
                        />
                    </div>

                    <div className="edit-form-group health-full-width">
                        <label htmlFor="vet-description">
                            Description
                        </label>
                        <textarea
                            id="vet-description"
                            value={form.description}
                            onChange={event =>
                                updateField(
                                    'description',
                                    event.target.value
                                )
                            }
                            maxLength={1000}
                            rows={4}
                            placeholder="Describe your experience and services..."
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
                        {loading ? 'Saving...' : 'Save profile'}
                    </button>
                </div>
            </form>
        </section>
    );
}