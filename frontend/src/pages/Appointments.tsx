import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    CalendarDays,
    CalendarCheck,
    Clock,
    Plus,
    Pencil,
    XCircle,
    CheckCircle2,
    PawPrint,
    Stethoscope,
    ClipboardList,
    MessageSquare,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { appointmentApi } from '../api/appointment.api';
import { veterinarianApi } from '../api/veterinarian.api';
import { petApi } from '../api/pet.api';
import { getApiError } from '../utils/apiError';

import AppointmentForm from '../components/AppointmentForm';
import AppointmentNotes from '../components/AppointmentNotes';

import type {
    Appointment,
    AppointmentStatus,
} from '../types/appointment';

import type { Veterinarian } from '../types/veterinarian';
import type { Pet } from '../types/pet';

import '../styles/health.css';
import '../styles/veterinarians.css';
import '../styles/appointments.css';

type StatusFilter = 'all' | AppointmentStatus;

const filters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All appointments' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-GB', {
        timeZone: 'Europe/Ljubljana',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatTime(date: string) {
    return new Date(date).toLocaleTimeString('en-GB', {
        timeZone: 'Europe/Ljubljana',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function Appointments() {
    const { user } = useAuth();

    const isOwner = user?.role === 'OWNER';
    const isVeterinarian = user?.role === 'VETERINARIAN';

    const [appointments, setAppointments] =
        useState<Appointment[]>([]);

    const [veterinarians, setVeterinarians] =
        useState<Veterinarian[]>([]);

    const [pets, setPets] = useState<Pet[]>([]);

    const [filter, setFilter] =
        useState<StatusFilter>('all');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formOpen, setFormOpen] = useState(false);

    const [editingAppointment, setEditingAppointment] =
        useState<Appointment>();

    const [updatingId, setUpdatingId] =
        useState<number | null>(null);

    const [expandedNotes, setExpandedNotes] =
        useState<number[]>([]);

    useEffect(() => {
        let active = true;

        async function loadAppointments() {
            try {
                const appointmentData =
                    await appointmentApi.getAppointments();

                if (active) {
                    setAppointments(appointmentData);
                }

                const veterinarianPromise =
                    veterinarianApi.getVeterinarians();

                const petPromise = isOwner
                    ? petApi.getPets()
                    : Promise.all(
                        [...new Set(
                            appointmentData.map(item => item.petId)
                        )].map(async petId => {
                            try {
                                return await petApi.getPet(petId);
                            } catch {
                                return null;
                            }
                        })
                    ).then(items =>
                        items.filter(
                            (pet): pet is Pet => pet !== null
                        )
                    );

                const [vetResult, petResult] =
                    await Promise.allSettled([
                        veterinarianPromise,
                        petPromise,
                    ]);

                if (active) {
                    if (vetResult.status === 'fulfilled') {
                        setVeterinarians(vetResult.value);
                    }

                    if (petResult.status === 'fulfilled') {
                        setPets(petResult.value);
                    }

                    if (
                        vetResult.status === 'rejected' ||
                        petResult.status === 'rejected'
                    ) {
                        setError(
                            'Some pet or veterinarian information could not be loaded.'
                        );
                    }
                }
            } catch (error) {
                if (active) {
                    setError(
                        getApiError(
                            error,
                            'Failed to load appointments.'
                        )
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadAppointments();

        return () => {
            active = false;
        };
    }, [isOwner, user?.id]);

    const pendingCount = appointments.filter(
        item => item.status === 'pending'
    ).length;

    const confirmedCount = appointments.filter(
        item => item.status === 'confirmed'
    ).length;

    const completedCount = appointments.filter(
        item => item.status === 'completed'
    ).length;

    const filteredAppointments = appointments
        .filter(item =>
            filter === 'all' || item.status === filter
        )
        .sort((a, b) =>
            new Date(a.appointmentDate).getTime() -
            new Date(b.appointmentDate).getTime()
        );

    function getPetName(petId: string) {
        return pets.find(pet => pet.id === petId)?.name
            || 'Pet information unavailable';
    }

    function getVeterinarianName(id: number) {
        const vet = veterinarians.find(item => item.id === id);

        return vet
            ? `Dr. ${vet.firstName} ${vet.lastName}`
            : 'Veterinarian information unavailable';
    }

    function handleCreate() {
        setEditingAppointment(undefined);
        setError('');
        setSuccess('');
        setFormOpen(true);
    }

    function handleEdit(appointment: Appointment) {
        setEditingAppointment(appointment);
        setError('');
        setSuccess('');
        setFormOpen(true);
    }

    function handleCloseForm() {
        setFormOpen(false);
        setEditingAppointment(undefined);
    }

    async function handleSaved(saved: Appointment) {
        setAppointments(previous => {
            const exists = previous.some(
                item => item.id === saved.id
            );

            return exists
                ? previous.map(item =>
                    item.id === saved.id ? saved : item
                )
                : [...previous, saved];
        });

        setSuccess(
            editingAppointment
                ? 'Appointment updated successfully.'
                : 'Appointment booked successfully.'
        );

        setFilter('all');

        try {
            const [pet, vet] = await Promise.all([
                petApi.getPet(saved.petId),
                veterinarianApi.getVeterinarian(
                    saved.veterinarianId
                ),
            ]);

            setPets(previous => [
                ...previous.filter(item => item.id !== pet.id),
                pet,
            ]);

            setVeterinarians(previous => [
                ...previous.filter(item => item.id !== vet.id),
                vet,
            ]);
        } catch {
            // The appointment was saved successfully.
            // Related information can be loaded after refresh.
        }
    }

    async function handleStatusChange(
        appointment: Appointment,
        status: AppointmentStatus
    ) {
        if (status === 'cancelled') {
            if (!window.confirm(
                'Are you sure you want to cancel this appointment?'
            )) {
                return;
            }
        }

        if (status === 'completed') {
            if (!window.confirm(
                'Mark this appointment as completed?'
            )) {
                return;
            }
        }

        setError('');
        setSuccess('');
        setUpdatingId(appointment.id);

        try {
            const updated = await appointmentApi.updateStatus(
                appointment.id,
                status
            );

            setAppointments(previous =>
                previous.map(item =>
                    item.id === updated.id ? updated : item
                )
            );

            setSuccess(
                `Appointment ${status} successfully.`
            );
        } catch (error) {
            setError(
                getApiError(
                    error,
                    'Failed to update appointment status.'
                )
            );
        } finally {
            setUpdatingId(null);
        }
    }

    function toggleNotes(id: number) {
        setExpandedNotes(previous =>
            previous.includes(id)
                ? previous.filter(item => item !== id)
                : [...previous, id]
        );
    }

    return (
        <div className="health-page appointments-page">
            <div className="health-heading">
                <div>
                    <h1>Appointments</h1>
                    <p>
                        {isOwner
                            ? 'Book and manage veterinary appointments for your pets.'
                            : 'Manage appointments and patient visits.'}
                    </p>
                </div>

                {isOwner && !formOpen && (
                    <button
                        className="primary-button"
                        onClick={handleCreate}
                        disabled={
                            loading || updatingId !== null
                        }
                    >
                        <Plus size={18} />
                        Book appointment
                    </button>
                )}
            </div>

            {error && (
                <div className="auth-error">{error}</div>
            )}

            {success && (
                <div className="profile-success">
                    {success}
                </div>
            )}

            <div className="appointment-summary-grid">
                <div className="health-summary">
                    <div className="health-summary-icon">
                        <CalendarDays size={25} />
                    </div>
                    <div>
                        <span>Total appointments</span>
                        <h2>{appointments.length}</h2>
                    </div>
                </div>

                <div className="health-summary">
                    <div className="health-summary-icon appointment-icon-pending">
                        <Clock size={25} />
                    </div>
                    <div>
                        <span>Pending</span>
                        <h2>{pendingCount}</h2>
                    </div>
                </div>

                <div className="health-summary">
                    <div className="health-summary-icon appointment-icon-confirmed">
                        <CalendarCheck size={25} />
                    </div>
                    <div>
                        <span>Confirmed</span>
                        <h2>{confirmedCount}</h2>
                    </div>
                </div>

                <div className="health-summary">
                    <div className="health-summary-icon">
                        <CheckCircle2 size={25} />
                    </div>
                    <div>
                        <span>Completed</span>
                        <h2>{completedCount}</h2>
                    </div>
                </div>
            </div>

            {formOpen && isOwner && (
                <AppointmentForm
                    key={editingAppointment?.id ?? 'new'}
                    appointment={editingAppointment}
                    appointments={appointments}
                    onSaved={handleSaved}
                    onClose={handleCloseForm}
                />
            )}

            <div className="appointment-filters">
                {filters.map(item => (
                    <button
                        key={item.value}
                        className={
                            `appointment-filter ${
                                filter === item.value
                                    ? 'active'
                                    : ''
                            }`
                        }
                        onClick={() => setFilter(item.value)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="health-empty">
                    <p>Loading appointments...</p>
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="health-empty">
                    <CalendarDays size={44} />
                    <h3>No appointments found</h3>
                    <p>
                        {filter !== 'all'
                            ? 'No appointments match this status.'
                            : 'Your appointments will appear here.'}
                    </p>
                </div>
            ) : (
                <div className="appointment-grid">
                    {filteredAppointments.map(appointment => {
                        const isActive =
                            appointment.status === 'pending' ||
                            appointment.status === 'confirmed';

                        const disabled =
                            formOpen || updatingId !== null;

                        const notesOpen = expandedNotes.includes(
                            appointment.id
                        );

                        return (
                            <article
                                className="appointment-card"
                                key={appointment.id}
                            >
                                <div className="appointment-card-header">
                                    <div className="appointment-card-icon">
                                        <CalendarDays size={25} />
                                    </div>

                                    <div className="appointment-card-title">
                                        <h2>
                                            {formatDate(
                                                appointment.appointmentDate
                                            )}
                                        </h2>

                                        <span>
                                            <Clock size={15} />
                                            {formatTime(
                                                appointment.appointmentDate
                                            )}
                                        </span>
                                    </div>

                                    <span
                                        className={
                                            `appointment-status status-${appointment.status}`
                                        }
                                    >
                                        {appointment.status}
                                    </span>
                                </div>

                                <div className="appointment-information">
                                    <div className="appointment-info-row">
                                        <PawPrint size={19} />

                                        <div>
                                            <span>Patient</span>
                                            <strong>
                                                {getPetName(
                                                    appointment.petId
                                                )}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="appointment-info-row">
                                        <Stethoscope size={19} />

                                        <div>
                                            <span>Veterinarian</span>
                                            <strong>
                                                {getVeterinarianName(
                                                    appointment.veterinarianId
                                                )}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="appointment-info-row">
                                        <ClipboardList size={19} />

                                        <div>
                                            <span>Reason for visit</span>
                                            <p>{appointment.reason}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="appointment-health-links">
                                    <Link
                                        to={`/pets/${appointment.petId}`}
                                    >
                                        <PawPrint size={16} />
                                        Pet details
                                    </Link>

                                    <Link
                                        to={`/health-history?petId=${appointment.petId}`}
                                    >
                                        <ClipboardList size={16} />
                                        Health history
                                    </Link>

                                    {isVeterinarian && (
                                        <>
                                            <Link
                                                to={`/vaccinations?petId=${appointment.petId}`}
                                            >
                                                Vaccinations
                                            </Link>

                                            <Link
                                                to={`/medications?petId=${appointment.petId}`}
                                            >
                                                Medications
                                            </Link>
                                        </>
                                    )}
                                </div>

                                {isActive && (
                                    <div className="appointment-actions">
                                        {isOwner && (
                                            <button
                                                className="secondary-button"
                                                onClick={() =>
                                                    handleEdit(appointment)
                                                }
                                                disabled={disabled}
                                            >
                                                <Pencil size={16} />
                                                Edit
                                            </button>
                                        )}

                                        {isVeterinarian &&
                                            appointment.status === 'pending' && (
                                                <button
                                                    className="primary-button"
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            appointment,
                                                            'confirmed'
                                                        )
                                                    }
                                                    disabled={disabled}
                                                >
                                                    <CheckCircle2 size={16} />
                                                    Confirm
                                                </button>
                                            )}

                                        {isVeterinarian &&
                                            appointment.status === 'confirmed' && (
                                                <button
                                                    className="primary-button"
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            appointment,
                                                            'completed'
                                                        )
                                                    }
                                                    disabled={disabled}
                                                >
                                                    <CheckCircle2 size={16} />
                                                    Complete
                                                </button>
                                            )}

                                        <button
                                            className="danger-outline-button"
                                            onClick={() =>
                                                handleStatusChange(
                                                    appointment,
                                                    'cancelled'
                                                )
                                            }
                                            disabled={disabled}
                                        >
                                            <XCircle size={16} />
                                            Cancel
                                        </button>
                                    </div>
                                )}

                                <button
                                    className="vet-availability-toggle"
                                    onClick={() =>
                                        toggleNotes(appointment.id)
                                    }
                                    aria-expanded={notesOpen}
                                >
                                    <MessageSquare size={18} />

                                    <span>
                                        {notesOpen
                                            ? 'Hide appointment notes'
                                            : 'View appointment notes'}
                                    </span>
                                </button>

                                {notesOpen && (
                                    <AppointmentNotes
                                        key={appointment.id}
                                        appointmentId={appointment.id}
                                        status={appointment.status}
                                    />
                                )}
                            </article>
                        );
                    })}
                </div>
            )}

            <p className="availability-hint">
                All appointment times are displayed in the
                Europe/Ljubljana time zone.
            </p>
        </div>
    );
}