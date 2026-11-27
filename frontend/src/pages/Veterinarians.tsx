import { useEffect, useState } from 'react';
import {
    Stethoscope,
    Search,
    MapPin,
    Phone,
    Building2,
    CalendarDays,
    Clock,
    Plus,
    Pencil,
    Trash2,
    UserRound,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { veterinarianApi } from '../api/veterinarian.api';
import { getApiError } from '../utils/apiError';
import VeterinarianForm from '../components/VeterinarianForm';
import AvailabilityForm from '../components/AvailabilityForm';

import type {
    Veterinarian,
    Availability,
} from '../types/veterinarian';

import '../styles/health.css';
import '../styles/veterinarians.css';

export default function Veterinarians() {
    const { user } = useAuth();

    const isVeterinarian = user?.role === 'VETERINARIAN';

    const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [profileFormOpen, setProfileFormOpen] = useState(false);

    const [editingVeterinarian, setEditingVeterinarian] =
        useState<Veterinarian>();

    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        let active = true;

        async function loadVeterinarians() {
            try {
                const data = await veterinarianApi.getVeterinarians();

                if (active) {
                    setVeterinarians(data);
                }
            } catch (error) {
                if (active) {
                    setError(
                        getApiError(error, 'Failed to load veterinarians.')
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadVeterinarians();

        return () => {
            active = false;
        };
    }, []);

    const myProfile = veterinarians.find(
        veterinarian => veterinarian.userId === user?.id
    );

    const filteredVeterinarians = veterinarians.filter(veterinarian => {
        const query = search.trim().toLowerCase();

        return [
            veterinarian.firstName,
            veterinarian.lastName,
            `${veterinarian.firstName} ${veterinarian.lastName}`,
            veterinarian.specialization,
            veterinarian.clinicName,
            veterinarian.address,
        ].some(value => value.toLowerCase().includes(query));
    });

    function handleCreateProfile() {
        setEditingVeterinarian(undefined);
        setError('');
        setSuccess('');
        setProfileFormOpen(true);
    }

    function handleEditProfile(veterinarian: Veterinarian) {
        setEditingVeterinarian(veterinarian);
        setError('');
        setSuccess('');
        setProfileFormOpen(true);
    }

    function handleProfileSaved(saved: Veterinarian) {
        setVeterinarians(previous => {
            const exists = previous.some(item => item.id === saved.id);

            return exists
                ? previous.map(item => item.id === saved.id ? saved : item)
                : [...previous, saved];
        });

        setSuccess(
            editingVeterinarian
                ? 'Professional profile updated successfully.'
                : 'Professional profile created successfully.'
        );
    }

    async function handleDeleteProfile(veterinarian: Veterinarian) {
        if (!isVeterinarian || veterinarian.userId !== user?.id) {
            return;
        }

        if (!window.confirm('Delete your professional veterinarian profile?')) {
            return;
        }

        setError('');
        setSuccess('');
        setDeletingId(veterinarian.id);

        try {
            await veterinarianApi.deleteVeterinarian(veterinarian.id);

            setVeterinarians(previous =>
                previous.filter(item => item.id !== veterinarian.id)
            );

            setSuccess('Professional profile deleted successfully.');
        } catch (error) {
            setError(
                getApiError(error, 'Failed to delete professional profile.')
            );
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="health-page veterinarians-page">
            <div className="health-heading">
                <div>
                    <h1>Veterinarians</h1>
                    <p>
                        Find veterinary professionals and explore
                        their available appointments.
                    </p>
                </div>

                {isVeterinarian &&
                    !myProfile &&
                    !loading &&
                    !error &&
                    !profileFormOpen && (
                        <button
                            className="primary-button"
                            onClick={handleCreateProfile}
                        >
                            <Plus size={18} />
                            Create professional profile
                        </button>
                    )}
            </div>

            {error && <div className="auth-error">{error}</div>}

            {success && (
                <div className="profile-success">{success}</div>
            )}

            {isVeterinarian && myProfile && (
                <div className="vet-profile-banner">
                    <div className="vet-profile-banner-icon">
                        <Stethoscope size={30} />
                    </div>

                    <div>
                        <h2>Your professional profile</h2>
                        <p>
                            Manage your information and appointment availability.
                        </p>
                    </div>

                    <button
                        className="secondary-button"
                        onClick={() => handleEditProfile(myProfile)}
                        disabled={profileFormOpen || deletingId !== null}
                    >
                        <Pencil size={17} />
                        Edit profile
                    </button>
                </div>
            )}

            {profileFormOpen && (
                <VeterinarianForm
                    key={editingVeterinarian?.id ?? 'new'}
                    veterinarian={editingVeterinarian}
                    onSaved={handleProfileSaved}
                    onClose={() => {
                        setProfileFormOpen(false);
                        setEditingVeterinarian(undefined);
                    }}
                />
            )}

            <div className="health-summary">
                <div className="health-summary-icon">
                    <Stethoscope size={26} />
                </div>

                <div>
                    <span>Registered veterinarians</span>
                    <h2>{veterinarians.length}</h2>
                </div>
            </div>

            <div className="vet-search">
                <Search size={20} />

                <input
                    type="search"
                    aria-label="Search veterinarians"
                    placeholder="Search by name, specialization, clinic or location..."
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                />
            </div>

            {loading ? (
                <div className="health-empty">
                    <p>Loading veterinarians...</p>
                </div>
            ) : filteredVeterinarians.length === 0 ? (
                <div className="health-empty">
                    <Stethoscope size={42} />
                    <h3>No veterinarians found</h3>
                    <p>
                        {search
                            ? 'Try a different search.'
                            : 'No veterinarian profiles are available yet.'}
                    </p>
                </div>
            ) : (
                <div className="vet-grid">
                    {filteredVeterinarians.map(veterinarian => (
                        <VeterinarianCard
                            key={veterinarian.id}
                            veterinarian={veterinarian}
                            isOwnProfile={
                                isVeterinarian &&
                                veterinarian.userId === user?.id
                            }
                            disabled={profileFormOpen || deletingId !== null}
                            onEdit={() => handleEditProfile(veterinarian)}
                            onDelete={() => handleDeleteProfile(veterinarian)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface VeterinarianCardProps {
    veterinarian: Veterinarian;
    isOwnProfile: boolean;
    disabled: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

function VeterinarianCard({
    veterinarian,
    isOwnProfile,
    disabled,
    onEdit,
    onDelete,
}: VeterinarianCardProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <article className="vet-card">
            <div className="vet-card-header">
                <div className="vet-avatar">
                    <UserRound size={32} />
                </div>

                <div className="vet-card-title">
                    <h2>
                        Dr. {veterinarian.firstName} {veterinarian.lastName}
                    </h2>

                    <span className="vet-specialization">
                        {veterinarian.specialization}
                    </span>

                    {isOwnProfile && (
                        <span className="vet-own-badge">Your profile</span>
                    )}
                </div>
            </div>

            <div className="vet-card-information">
                <div className="vet-information-row">
                    <Building2 size={18} />
                    <span>{veterinarian.clinicName}</span>
                </div>

                <div className="vet-information-row">
                    <MapPin size={18} />
                    <span>{veterinarian.address}</span>
                </div>

                {veterinarian.phone && (
                    <div className="vet-information-row">
                        <Phone size={18} />
                        <span>{veterinarian.phone}</span>
                    </div>
                )}
            </div>

            {veterinarian.description && (
                <p className="vet-description">
                    {veterinarian.description}
                </p>
            )}

            <button
                className="vet-availability-toggle"
                onClick={() => setExpanded(previous => !previous)}
                aria-expanded={expanded}
            >
                <CalendarDays size={18} />
                <span>
                    {expanded ? 'Hide availability' : 'View availability'}
                </span>

                {expanded
                    ? <ChevronUp size={18} />
                    : <ChevronDown size={18} />}
            </button>

            {expanded && (
                <AvailabilitySection
                    veterinarianId={veterinarian.id}
                    canManage={isOwnProfile}
                />
            )}

            {isOwnProfile && (
                <div className="health-record-actions">
                    <button
                        className="secondary-button"
                        onClick={onEdit}
                        disabled={disabled}
                    >
                        <Pencil size={16} />
                        Edit
                    </button>

                    <button
                        className="danger-outline-button"
                        onClick={onDelete}
                        disabled={disabled}
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                </div>
            )}
        </article>
    );
}

interface AvailabilitySectionProps {
    veterinarianId: number;
    canManage: boolean;
}

function AvailabilitySection({
    veterinarianId,
    canManage,
}: AvailabilitySectionProps) {
    const [slots, setSlots] = useState<Availability[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formOpen, setFormOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<Availability>();
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        let active = true;

        async function loadAvailability() {
            try {
                const data = await veterinarianApi.getAvailability(
                    veterinarianId
                );

                if (active) {
                    setSlots(data);
                }
            } catch (error) {
                if (active) {
                    setError(
                        getApiError(error, 'Failed to load availability.')
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadAvailability();

        return () => {
            active = false;
        };
    }, [veterinarianId]);

    const sortedSlots = [...slots].sort((a, b) =>
        `${a.date}T${a.startTime}`.localeCompare(
            `${b.date}T${b.startTime}`
        )
    );

    function formatDate(date: string) {
        return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }

    function handleAdd() {
        setEditingSlot(undefined);
        setError('');
        setSuccess('');
        setFormOpen(true);
    }

    function handleEdit(slot: Availability) {
        setEditingSlot(slot);
        setError('');
        setSuccess('');
        setFormOpen(true);
    }

    function handleSaved(saved: Availability) {
        setSlots(previous => {
            const exists = previous.some(item => item.id === saved.id);

            return exists
                ? previous.map(item => item.id === saved.id ? saved : item)
                : [...previous, saved];
        });

        setSuccess(
            editingSlot
                ? 'Availability updated successfully.'
                : 'Availability added successfully.'
        );
    }

    async function handleDelete(slot: Availability) {
        if (!canManage) return;

        if (!window.confirm('Delete this availability slot?')) {
            return;
        }

        setDeletingId(slot.id);
        setError('');
        setSuccess('');

        try {
            await veterinarianApi.deleteAvailability(
                veterinarianId,
                slot.id
            );

            setSlots(previous =>
                previous.filter(item => item.id !== slot.id)
            );

            setSuccess('Availability deleted successfully.');
        } catch (error) {
            setError(
                getApiError(error, 'Failed to delete availability.')
            );
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <section className="vet-availability-section">
            <div className="vet-availability-heading">
                <h3>Availability</h3>

                {canManage && !formOpen && (
                    <button
                        className="primary-button"
                        onClick={handleAdd}
                        disabled={loading || deletingId !== null}
                    >
                        <Plus size={16} />
                        Add slot
                    </button>
                )}
            </div>

            {error && <div className="auth-error">{error}</div>}

            {success && (
                <div className="profile-success">{success}</div>
            )}

            {formOpen && (
                <AvailabilityForm
                    key={editingSlot?.id ?? 'new'}
                    veterinarianId={veterinarianId}
                    availability={editingSlot}
                    onSaved={handleSaved}
                    onClose={() => {
                        setFormOpen(false);
                        setEditingSlot(undefined);
                    }}
                />
            )}

            {loading ? (
                <p className="vet-empty-slots">Loading availability...</p>
            ) : sortedSlots.length === 0 ? (
                <p className="vet-empty-slots">
                    No availability slots found.
                </p>
            ) : (
                <div className="vet-slots">
                    {sortedSlots.map(slot => (
                        <div className="vet-slot" key={slot.id}>
                            <div className="vet-slot-icon">
                                <CalendarDays size={20} />
                            </div>

                            <div className="vet-slot-info">
                                <strong>{formatDate(slot.date)}</strong>

                                <span>
                                    <Clock size={14} />
                                    {slot.startTime.slice(0, 5)}
                                    {' – '}
                                    {slot.endTime.slice(0, 5)}
                                </span>
                            </div>

                            {canManage && (
                                <div className="vet-slot-actions">
                                    <button
                                        className="icon-button"
                                        aria-label="Edit availability"
                                        onClick={() => handleEdit(slot)}
                                        disabled={
                                            formOpen || deletingId !== null
                                        }
                                    >
                                        <Pencil size={17} />
                                    </button>

                                    <button
                                        className="icon-button vet-delete-button"
                                        aria-label="Delete availability"
                                        onClick={() => handleDelete(slot)}
                                        disabled={
                                            formOpen || deletingId !== null
                                        }
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <p className="availability-hint">
                All times are displayed in the Europe/Ljubljana time zone.
            </p>
        </section>
    );
}