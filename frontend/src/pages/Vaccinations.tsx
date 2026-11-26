import { useEffect, useState } from 'react';
import {
    Syringe,
    CalendarDays,
    ClipboardList,
    Plus,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { healthApi } from '../api/health.api';
import { getApiError } from '../utils/apiError';
import type { Vaccination } from '../types/health';
import VaccinationForm from '../components/VaccinationForm';
import '../styles/health.css';

export default function Vaccinations() {
    const { user } = useAuth();

    const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formOpen, setFormOpen] = useState(false);

    const [editingVaccination, setEditingVaccination] =
        useState<Vaccination | undefined>(undefined);

    const [deletingId, setDeletingId] = useState<string | null>(null);

    const petId = 'pet-001';
    const isVeterinarian = user?.role === 'VETERINARIAN';

    useEffect(() => {
        const loadVaccinations = async () => {
            try {
                const data = await healthApi.getVaccinations(petId);
                setVaccinations(data);
            } catch (error) {
                setError(
                    getApiError(error, 'Failed to load vaccinations.')
                );
            } finally {
                setLoading(false);
            }
        };

        void loadVaccinations();
    }, [petId]);

    const formatDate = (date: string | null) => {
        if (!date) return 'Not scheduled';

        return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleAdd = () => {
        setEditingVaccination(undefined);
        setError('');
        setSuccess('');
        setFormOpen(true);
    };

    const handleEdit = (vaccination: Vaccination) => {
        setEditingVaccination(vaccination);
        setError('');
        setSuccess('');
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        setFormOpen(false);
        setEditingVaccination(undefined);
    };

    const handleSaved = (savedVaccination: Vaccination) => {
        setVaccinations((previous) => {
            const exists = previous.some(
                (item) => item.id === savedVaccination.id
            );

            const updated = exists
                ? previous.map((item) =>
                    item.id === savedVaccination.id
                        ? savedVaccination
                        : item
                )
                : [savedVaccination, ...previous];

            return updated.sort((a, b) =>
                b.vaccination_date.localeCompare(a.vaccination_date)
            );
        });

        setSuccess(
            editingVaccination
                ? 'Vaccination updated successfully.'
                : 'Vaccination added successfully.'
        );
    };

    const handleDelete = async (vaccination: Vaccination) => {
        if (
            !isVeterinarian ||
            vaccination.veterinarian_id !== user?.id ||
            deletingId
        ) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${vaccination.vaccine_name}"?`
        );

        if (!confirmed) return;

        setError('');
        setSuccess('');
        setDeletingId(vaccination.id);

        try {
            await healthApi.deleteVaccination(vaccination.id);

            setVaccinations((previous) =>
                previous.filter(
                    (item) => item.id !== vaccination.id
                )
            );

            setSuccess('Vaccination deleted successfully.');
        } catch (error) {
            setError(
                getApiError(error, 'Failed to delete vaccination.')
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="health-page">
            <div className="health-heading">
                <div className="page-heading">
                    <h1>Vaccinations</h1>
                    <p>
                        View and manage your pet's vaccination records.
                    </p>
                </div>

                {isVeterinarian && !formOpen && (
                    <button
                        className="primary-button"
                        onClick={handleAdd}
                        disabled={loading || deletingId !== null}
                    >
                        <Plus size={19} />
                        Add vaccination
                    </button>
                )}
            </div>

            {success && (
                <div className="profile-success">{success}</div>
            )}

            {error && (
                <div className="auth-error">{error}</div>
            )}

            <div className="health-summary">
                <div className="health-summary-icon">
                    <Syringe size={28} />
                </div>

                <div>
                    <span>Total vaccinations</span>
                    <h2>{vaccinations.length}</h2>
                </div>
            </div>

            {formOpen && isVeterinarian && (
                <VaccinationForm
                    key={editingVaccination?.id || 'new'}
                    petId={petId}
                    vaccination={editingVaccination}
                    onClose={handleCloseForm}
                    onSaved={handleSaved}
                />
            )}

            <section className="health-records">
                <div className="health-section-heading">
                    <h2>Vaccination records</h2>
                    <p>Pet ID: {petId}</p>
                </div>

                {loading && (
                    <div className="health-empty">
                        Loading vaccinations...
                    </div>
                )}

                {!loading && !error && vaccinations.length === 0 && (
                    <div className="health-empty">
                        <Syringe size={42} />
                        <h3>No vaccinations yet</h3>
                        <p>Vaccination records will appear here.</p>
                    </div>
                )}

                <div className="health-grid">
                    {vaccinations.map((vaccination) => (
                        <article
                            className="health-record-card"
                            key={vaccination.id}
                        >
                            <div className="health-record-header">
                                <div className="health-record-icon">
                                    <Syringe size={23} />
                                </div>

                                <h3>{vaccination.vaccine_name}</h3>
                            </div>

                            <div className="health-record-field">
                                <CalendarDays size={18} />
                                <div>
                                    <span>Vaccination date</span>
                                    <strong>
                                        {formatDate(
                                            vaccination.vaccination_date
                                        )}
                                    </strong>
                                </div>
                            </div>

                            <div className="health-record-field">
                                <CalendarDays size={18} />
                                <div>
                                    <span>Next due date</span>
                                    <strong>
                                        {formatDate(
                                            vaccination.next_due_date
                                        )}
                                    </strong>
                                </div>
                            </div>

                            <div className="health-record-field">
                                <ClipboardList size={18} />
                                <div>
                                    <span>Notes</span>
                                    <strong>
                                        {vaccination.notes || 'No notes'}
                                    </strong>
                                </div>
                            </div>

                            {isVeterinarian &&
                                vaccination.veterinarian_id === user?.id && (
                                    <div className="health-record-actions">
                                        <button
                                            className="secondary-button"
                                            onClick={() =>
                                                handleEdit(vaccination)
                                            }
                                            disabled={
                                                formOpen ||
                                                deletingId !== null
                                            }
                                        >
                                            <Pencil size={16} />
                                            Edit
                                        </button>

                                        <button
                                            className="danger-outline-button"
                                            onClick={() =>
                                                handleDelete(vaccination)
                                            }
                                            disabled={
                                                formOpen ||
                                                deletingId !== null
                                            }
                                        >
                                            <Trash2 size={16} />
                                            {deletingId === vaccination.id
                                                ? 'Deleting...'
                                                : 'Delete'}
                                        </button>
                                    </div>
                                )}
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}