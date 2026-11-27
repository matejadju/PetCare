import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Save, X } from 'lucide-react';

import { petApi } from '../api/pet.api';
import { veterinarianApi } from '../api/veterinarian.api';
import { appointmentApi } from '../api/appointment.api';
import { getApiError } from '../utils/apiError';

import type { Pet } from '../types/pet';
import type {
    Veterinarian,
    Availability,
} from '../types/veterinarian';
import type {
    Appointment,
    AppointmentRequest,
} from '../types/appointment';

interface AppointmentFormProps {
    appointment?: Appointment;
    appointments: Appointment[];
    onClose: () => void;
    onSaved: (appointment: Appointment) => void;
}

const timeZone = 'Europe/Ljubljana';

function getAppointmentDate(slot: Availability): string {
    const localDate = `${slot.date}T${slot.startTime.slice(0, 8)}`;
    const baseTime = Date.parse(`${localDate}Z`);

    const formatter = new Intl.DateTimeFormat('sv-SE', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    });

    for (let offset = 0; offset <= 180; offset += 15) {
        const candidate = new Date(baseTime - offset * 60000);

        const formatted = formatter
            .format(candidate)
            .replace(' ', 'T');

        if (formatted === localDate) {
            return candidate.toISOString();
        }
    }

    throw new Error('Invalid appointment time.');
}

function formatSlot(slot: Availability) {
    const date = new Date(
        `${slot.date}T00:00:00`
    ).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return `${date}, ${slot.startTime.slice(0, 5)} – ${slot.endTime.slice(0, 5)}`;
}

export default function AppointmentForm({
    appointment,
    appointments,
    onClose,
    onSaved,
}: AppointmentFormProps) {
    const [pets, setPets] = useState<Pet[]>([]);
    const [veterinarians, setVeterinarians] =
        useState<Veterinarian[]>([]);
    const [slots, setSlots] = useState<Availability[]>([]);

    const [petId, setPetId] = useState(
        appointment?.petId || ''
    );

    const [veterinarianId, setVeterinarianId] = useState(
        appointment?.veterinarianId.toString() || ''
    );

    const [availabilityId, setAvailabilityId] = useState(
        appointment?.availabilityId.toString() || ''
    );

    const [reason, setReason] = useState(
        appointment?.reason || ''
    );

    const [loading, setLoading] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [saving, setSaving] = useState(false);
    const [currentTime] = useState(() => Date.now());

    const [error, setError] = useState('');
    const [slotError, setSlotError] = useState('');

    useEffect(() => {
        let active = true;

        async function loadData() {
            try {
                const [petData, veterinarianData] =
                    await Promise.all([
                        petApi.getPets(),
                        veterinarianApi.getVeterinarians(),
                    ]);

                if (active) {
                    setPets(petData);
                    setVeterinarians(veterinarianData);
                }
            } catch (error) {
                if (active) {
                    setError(
                        getApiError(
                            error,
                            'Failed to load appointment data.'
                        )
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadData();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!veterinarianId) return;

        let active = true;

        async function loadAvailability() {
            setLoadingSlots(true);
            setSlotError('');

            try {
                const data =
                    await veterinarianApi.getAvailability(
                        Number(veterinarianId)
                    );

                if (active) {
                    setSlots(data);
                }
            } catch (error) {
                if (active) {
                    setSlotError(
                        getApiError(
                            error,
                            'Failed to load availability.'
                        )
                    );
                }
            } finally {
                if (active) {
                    setLoadingSlots(false);
                }
            }
        }

        loadAvailability();

        return () => {
            active = false;
        };
    }, [veterinarianId]);

    const availableSlots = slots
        .filter(slot => {
            if (slot.veterinarianId !== Number(veterinarianId)) {
                return false;
            }

            try {
                const date = getAppointmentDate(slot);

                if (new Date(date).getTime() <= currentTime) {
                    return false;
                }
            } catch {
                return false;
            }

            const alreadyBooked = appointments.some(item =>
                item.id !== appointment?.id &&
                item.availabilityId === slot.id &&
                item.status !== 'cancelled'
            );

            return !alreadyBooked;
        })
        .sort((a, b) =>
            `${a.date}T${a.startTime}`.localeCompare(
                `${b.date}T${b.startTime}`
            )
        );

    const selectedSlot = availableSlots.find(
        slot => slot.id === Number(availabilityId)
    );

    function handleVeterinarianChange(value: string) {
        setVeterinarianId(value);
        setAvailabilityId('');
        setSlots([]);
        setSlotError('');
        setLoadingSlots(Boolean(value));
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setError('');

        if (
            !petId ||
            !veterinarianId ||
            !selectedSlot ||
            !reason.trim()
        ) {
            setError('Please complete all required fields.');
            return;
        }

        try {
            setSaving(true);

            const data: AppointmentRequest = {
                petId,
                veterinarianId: Number(veterinarianId),
                availabilityId: selectedSlot.id,
                appointmentDate: getAppointmentDate(selectedSlot),
                reason: reason.trim(),
            };

            const saved = appointment
                ? await appointmentApi.updateAppointment(
                    appointment.id,
                    data
                )
                : await appointmentApi.createAppointment(data);

            onSaved(saved);
            onClose();
        } catch (error) {
            setError(
                getApiError(error, 'Failed to save appointment.')
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="health-form-card">
            <div className="profile-card-header">
                <h2>
                    {appointment
                        ? 'Edit appointment'
                        : 'Book an appointment'}
                </h2>

                <button
                    type="button"
                    className="icon-button"
                    onClick={onClose}
                    disabled={saving}
                    aria-label="Close form"
                >
                    <X size={20} />
                </button>
            </div>

            {error && (
                <div className="auth-error">{error}</div>
            )}

            {loading ? (
                <div className="health-empty">
                    <p>Loading appointment data...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="edit-form-grid">
                        <div className="edit-form-group">
                            <label htmlFor="appointment-pet">
                                Pet *
                            </label>

                            <select
                                id="appointment-pet"
                                value={petId}
                                onChange={event =>
                                    setPetId(event.target.value)
                                }
                                disabled={saving}
                                required
                            >
                                <option value="">
                                    Select your pet
                                </option>

                                {pets.map(pet => (
                                    <option
                                        key={pet.id}
                                        value={pet.id}
                                    >
                                        {pet.name} ({pet.species})
                                    </option>
                                ))}
                            </select>

                            {pets.length === 0 && (
                                <p className="availability-hint">
                                    Add a pet before booking
                                    an appointment.
                                </p>
                            )}
                        </div>

                        <div className="edit-form-group">
                            <label htmlFor="appointment-vet">
                                Veterinarian *
                            </label>

                            <select
                                id="appointment-vet"
                                value={veterinarianId}
                                onChange={event =>
                                    handleVeterinarianChange(
                                        event.target.value
                                    )
                                }
                                disabled={saving}
                                required
                            >
                                <option value="">
                                    Select a veterinarian
                                </option>

                                {veterinarians.map(vet => (
                                    <option
                                        key={vet.id}
                                        value={vet.id}
                                    >
                                        Dr. {vet.firstName} {vet.lastName}
                                        {' – '}
                                        {vet.specialization}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="edit-form-group health-full-width">
                            <label htmlFor="appointment-slot">
                                Appointment date and time *
                            </label>

                            <select
                                id="appointment-slot"
                                value={availabilityId}
                                onChange={event =>
                                    setAvailabilityId(
                                        event.target.value
                                    )
                                }
                                disabled={
                                    !veterinarianId ||
                                    loadingSlots ||
                                    saving
                                }
                                required
                            >
                                <option value="">
                                    {!veterinarianId
                                        ? 'Select a veterinarian first'
                                        : loadingSlots
                                            ? 'Loading time slots...'
                                            : 'Select a time slot'}
                                </option>

                                {availableSlots.map(slot => (
                                    <option
                                        key={slot.id}
                                        value={slot.id}
                                    >
                                        {formatSlot(slot)}
                                    </option>
                                ))}
                            </select>

                            {slotError && (
                                <div className="auth-error">
                                    {slotError}
                                </div>
                            )}

                            {veterinarianId &&
                                !loadingSlots &&
                                !slotError &&
                                availableSlots.length === 0 && (
                                    <p className="availability-hint">
                                        No upcoming time slots found.
                                    </p>
                                )}

                            <p className="availability-hint">
                                Times are displayed in the
                                Europe/Ljubljana time zone.
                                Slot availability is confirmed
                                when booking.
                            </p>
                        </div>

                        <div className="edit-form-group health-full-width">
                            <label htmlFor="appointment-reason">
                                Reason for appointment *
                            </label>

                            <textarea
                                id="appointment-reason"
                                value={reason}
                                onChange={event =>
                                    setReason(event.target.value)
                                }
                                placeholder="Describe the reason for your visit..."
                                maxLength={1000}
                                rows={4}
                                disabled={saving}
                                required
                            />
                        </div>
                    </div>

                    {appointment && (
                        <p className="availability-hint">
                            Updating an appointment will reset
                            its status to pending.
                        </p>
                    )}

                    <div className="profile-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={
                                saving ||
                                loadingSlots ||
                                !selectedSlot ||
                                pets.length === 0
                            }
                        >
                            <Save size={18} />

                            {saving
                                ? 'Saving...'
                                : appointment
                                    ? 'Save changes'
                                    : 'Book appointment'}
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}