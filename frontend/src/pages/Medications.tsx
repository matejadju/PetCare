import { useEffect, useState } from 'react';
import {
    Pill,
    CalendarDays,
    ClipboardList,
    Plus,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { healthApi } from '../api/health.api';
import { getApiError } from '../utils/apiError';
import type { Medication } from '../types/health';
import MedicationForm from '../components/MedicationForm';
import PetSelector from '../components/PetSelector';
import { usePetSelection } from '../hooks/usePetSelection';
import '../styles/health.css';

export default function Medications() {
    const selection = usePetSelection();

    return (
        <div className="health-page">
            <PetSelector {...selection} />
            {!selection.loading && selection.selectedPet &&
                (!selection.requestedPetId || selection.requestedPetId === selection.petId) && (
                <MedicationRecords
                    key={selection.petId}
                    petId={selection.petId}
                    petName={selection.selectedPet.name}
                />
            )}
        </div>
    );
}

interface MedicationRecordsProps {
    petId: string;
    petName: string;
}

function MedicationRecords({ petId, petName }: MedicationRecordsProps) {
    const { user } = useAuth();

    const [medications, setMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formOpen, setFormOpen] = useState(false);

    const [editingMedication, setEditingMedication] =
        useState<Medication | undefined>(undefined);

    const [deletingId, setDeletingId] = useState<string | null>(null);

    const isVeterinarian = user?.role === 'VETERINARIAN';

    useEffect(() => {
        let active = true;

        const loadRecords = async () => {
            try {
                const data = await healthApi.getMedications(petId);
                if (active) setMedications(data);
            } catch (error) {
                if (active) {
                    setError(getApiError(error, 'Failed to load medications.'));
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        void loadRecords();

        return () => {
            active = false;
        };
    }, [petId]);

    const formatDate = (date: string | null) => {
        if (!date) return 'Not specified';

        return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleAdd = () => {
        setEditingMedication(undefined);
        setError('');
        setSuccess('');
        setFormOpen(true);
    };

    const handleEdit = (medication: Medication) => {
        setEditingMedication(medication);
        setError('');
        setSuccess('');
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        setFormOpen(false);
        setEditingMedication(undefined);
    };

    const handleSaved = (savedMedication: Medication) => {
        setMedications((previous) => {
            const exists = previous.some(
                (item) => item.id === savedMedication.id
            );

            const updated = exists
                ? previous.map((item) =>
                    item.id === savedMedication.id
                        ? savedMedication
                        : item
                )
                : [savedMedication, ...previous];

            return updated.sort((a, b) =>
                b.start_date.localeCompare(a.start_date)
            );
        });

        setSuccess(
            editingMedication
                ? 'Medication updated successfully.'
                : 'Medication added successfully.'
        );
    };

    const handleDelete = async (medication: Medication) => {
        if (
            !isVeterinarian ||
            medication.veterinarian_id !== user?.id ||
            deletingId
        ) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${medication.medication_name}"?`
        );

        if (!confirmed) return;

        setError('');
        setSuccess('');
        setDeletingId(medication.id);

        try {
            await healthApi.deleteMedication(medication.id);

            setMedications((previous) =>
                previous.filter(
                    (item) => item.id !== medication.id
                )
            );

            setSuccess('Medication deleted successfully.');
        } catch (error) {
            setError(
                getApiError(error, 'Failed to delete medication.')
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="health-page">
            <div className="health-heading">
                <div className="page-heading">
                    <h1>Medications</h1>
                    <p>
                        View and manage your pet's medications
                        and treatment records.
                    </p>
                </div>

                {isVeterinarian && !formOpen && (
                    <button
                        className="primary-button"
                        onClick={handleAdd}
                        disabled={loading || deletingId !== null}
                    >
                        <Plus size={19} />
                        Add medication
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
                    <Pill size={28} />
                </div>

                <div>
                    <span>Total medications</span>
                    <h2>{medications.length}</h2>
                </div>
            </div>

            {formOpen && isVeterinarian && (
                <MedicationForm
                    key={editingMedication?.id || 'new'}
                    petId={petId}
                    medication={editingMedication}
                    onClose={handleCloseForm}
                    onSaved={handleSaved}
                />
            )}

            <section className="health-records">
                <div className="health-section-heading">
                    <h2>Medication records</h2>
                    <p>Pet: {petName}</p>
                </div>

                {loading && (
                    <div className="health-empty">
                        Loading medications...
                    </div>
                )}

                {!loading && !error && medications.length === 0 && (
                    <div className="health-empty">
                        <Pill size={42} />
                        <h3>No medications yet</h3>
                        <p>Medication records will appear here.</p>
                    </div>
                )}

                <div className="health-grid">
                    {medications.map((medication) => (
                        <article
                            className="health-record-card"
                            key={medication.id}
                        >
                            <div className="health-record-header">
                                <div className="health-record-icon">
                                    <Pill size={23} />
                                </div>

                                <h3>{medication.medication_name}</h3>
                            </div>

                            <div className="health-record-field">
                                <Pill size={18} />
                                <div>
                                    <span>Dosage</span>
                                    <strong>{medication.dosage}</strong>
                                </div>
                            </div>

                            <div className="health-record-field">
                                <CalendarDays size={18} />
                                <div>
                                    <span>Start date</span>
                                    <strong>
                                        {formatDate(
                                            medication.start_date
                                        )}
                                    </strong>
                                </div>
                            </div>

                            <div className="health-record-field">
                                <CalendarDays size={18} />
                                <div>
                                    <span>End date</span>
                                    <strong>
                                        {formatDate(
                                            medication.end_date
                                        )}
                                    </strong>
                                </div>
                            </div>

                            <div className="health-record-field">
                                <ClipboardList size={18} />
                                <div>
                                    <span>Instructions</span>
                                    <strong>
                                        {medication.instructions ||
                                            'No instructions'}
                                    </strong>
                                </div>
                            </div>

                            {isVeterinarian &&
                                medication.veterinarian_id === user?.id && (
                                    <div className="health-record-actions">
                                        <button
                                            className="secondary-button"
                                            onClick={() =>
                                                handleEdit(medication)
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
                                                handleDelete(medication)
                                            }
                                            disabled={
                                                formOpen ||
                                                deletingId !== null
                                            }
                                        >
                                            <Trash2 size={16} />
                                            {deletingId === medication.id
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
