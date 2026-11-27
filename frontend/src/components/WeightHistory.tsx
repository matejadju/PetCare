import { useEffect, useState } from 'react';
import {
    Weight,
    Plus,
    Pencil,
    Trash2,
    TrendingUp,
    ClipboardList,
} from 'lucide-react';

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';

import { useAuth } from '../hooks/useAuth';
import { petApi } from '../api/pet.api';
import { getApiError } from '../utils/apiError';
import type { PetWeight } from '../types/pet';
import WeightForm from './WeightForm';

import '../styles/weight.css';

interface WeightHistoryProps {
    petId: string;
    onWeightChange: (weight: number | null) => void;
}

export default function WeightHistory({
    petId,
    onWeightChange,
}: WeightHistoryProps) {
    const { user } = useAuth();
    const isOwner = user?.role === 'OWNER';

    const [measurements, setMeasurements] = useState<PetWeight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formOpen, setFormOpen] = useState(false);
    const [editingMeasurement, setEditingMeasurement] =
        useState<PetWeight>();

    const [deletingId, setDeletingId] =
        useState<string | null>(null);

    useEffect(() => {
        let active = true;

        petApi.getWeights(petId)
            .then((data) => {
                if (active) {
                    setMeasurements(data);
                }
            })
            .catch((error) => {
                if (active) {
                    setError(
                        getApiError(
                            error,
                            'Failed to load weight history.'
                        )
                    );
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [petId]);

    const sortedMeasurements = [...measurements].sort(
        (a, b) =>
            new Date(b.measuredAt).getTime() -
            new Date(a.measuredAt).getTime()
    );

    const currentWeight = sortedMeasurements.length
        ? Number(sortedMeasurements[0].weight)
        : null;

    const firstWeight = sortedMeasurements.length
        ? Number(
            sortedMeasurements[sortedMeasurements.length - 1].weight
        )
        : null;

    const weightChange =
        currentWeight !== null && firstWeight !== null
            ? currentWeight - firstWeight
            : null;

    const chartData = [...sortedMeasurements]
        .reverse()
        .map((measurement) => ({
            date: new Date(measurement.measuredAt).getTime(),
            weight: Number(measurement.weight),
        }));

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleAdd = () => {
        setEditingMeasurement(undefined);
        setError('');
        setSuccess('');
        setFormOpen(true);
    };

    const handleEdit = (measurement: PetWeight) => {
        setEditingMeasurement(measurement);
        setError('');
        setSuccess('');
        setFormOpen(true);
    };

    const handleClose = () => {
        setEditingMeasurement(undefined);
        setFormOpen(false);
    };

    const refreshMeasurements = async () => {
        const data = await petApi.getWeights(petId);

        setMeasurements(data);

        const sorted = [...data].sort(
            (a, b) =>
                new Date(b.measuredAt).getTime() -
                new Date(a.measuredAt).getTime()
        );

        onWeightChange(
            sorted.length ? Number(sorted[0].weight) : null
        );
    };

    const handleSaved = (savedMeasurement: PetWeight) => {
        const updated = [
            ...measurements.filter(
                (item) => item.id !== savedMeasurement.id
            ),
            savedMeasurement,
        ];

        setMeasurements(updated);

        const sorted = [...updated].sort(
            (a, b) =>
                new Date(b.measuredAt).getTime() -
                new Date(a.measuredAt).getTime()
        );

        onWeightChange(
            sorted.length ? Number(sorted[0].weight) : null
        );

        setSuccess(
            editingMeasurement
                ? 'Measurement updated successfully.'
                : 'Measurement added successfully.'
        );
    };

    const handleDelete = async (measurement: PetWeight) => {
        if (!isOwner) {
            return;
        }

        const confirmed = window.confirm(
            'Are you sure you want to delete this measurement?'
        );

        if (!confirmed) {
            return;
        }

        setDeletingId(measurement.id);
        setError('');
        setSuccess('');

        try {
            await petApi.deleteWeight(
                petId,
                measurement.id
            );

            setSuccess('Measurement deleted successfully.');

            try {
                await refreshMeasurements();
            } catch {
                const remaining = measurements.filter(
                    (item) => item.id !== measurement.id
                );

                setMeasurements(remaining);

                const sorted = [...remaining].sort(
                    (a, b) =>
                        new Date(b.measuredAt).getTime() -
                        new Date(a.measuredAt).getTime()
                );

                onWeightChange(
                    sorted.length ? Number(sorted[0].weight) : null
                );

                setError(
                    'Measurement deleted, but refreshing the history failed.'
                );
            }
        } catch (error) {
            setError(
                getApiError(
                    error,
                    'Failed to delete measurement.'
                )
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <section className="weight-section">
            <div className="weight-heading">
                <div>
                    <h2>Weight History</h2>
                    <p>Track weight measurements over time.</p>
                </div>

                {isOwner && !formOpen && (
                    <button
                        className="primary-button"
                        onClick={handleAdd}
                        disabled={loading || deletingId !== null}
                    >
                        <Plus size={18} />
                        Add measurement
                    </button>
                )}
            </div>

            {error && (
                <div className="auth-error">{error}</div>
            )}

            {success && (
                <div className="profile-success">{success}</div>
            )}

            {loading ? (
                <div className="health-empty">
                    <p>Loading weight history...</p>
                </div>
            ) : (
                <>
                    <div className="weight-summary-grid">
                        <div className="weight-summary-card">
                            <Weight size={25} />

                            <span>Current weight</span>

                            <strong>
                                {currentWeight !== null
                                    ? `${currentWeight} kg`
                                    : 'Not recorded'}
                            </strong>
                        </div>

                        <div className="weight-summary-card">
                            <TrendingUp size={25} />

                            <span>Weight change</span>

                            <strong>
                                {weightChange !== null
                                    ? `${weightChange > 0 ? '+' : ''}${Number(
                                        weightChange.toFixed(3)
                                    )} kg`
                                    : 'Not recorded'}
                            </strong>
                        </div>

                        <div className="weight-summary-card">
                            <ClipboardList size={25} />

                            <span>Measurements</span>

                            <strong>
                                {measurements.length}
                            </strong>
                        </div>
                    </div>

                    {formOpen && (
                        <WeightForm
                            key={editingMeasurement?.id || 'new'}
                            petId={petId}
                            measurement={editingMeasurement}
                            onClose={handleClose}
                            onSaved={handleSaved}
                        />
                    )}

                    {measurements.length > 0 && (
                        <div className="weight-chart-card">
                            <h3>Weight progress</h3>

                            <div className="weight-chart">
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <LineChart data={chartData}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e5e7eb"
                                        />

                                        <XAxis
                                            dataKey="date"
                                            type="number"
                                            scale="time"
                                            domain={['dataMin', 'dataMax']}
                                            tickFormatter={(value) =>
                                                new Date(value)
                                                    .toLocaleDateString('en-GB', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                    })
                                            }
                                        />

                                        <YAxis
                                            unit=" kg"
                                            domain={['auto', 'auto']}
                                            width={75}
                                        />

                                        <Tooltip
                                            labelFormatter={(value) =>
                                                formatDate(
                                                    new Date(Number(value))
                                                        .toISOString()
                                                )
                                            }
                                        />

                                        <Line
                                            type="linear"
                                            dataKey="weight"
                                            name="Weight (kg)"
                                            stroke="#347b59"
                                            strokeWidth={3}
                                            dot={{ r: 5 }}
                                            activeDot={{ r: 7 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    <div className="weight-history-card">
                        <h3>Measurement history</h3>

                        {sortedMeasurements.length === 0 ? (
                            <div className="health-empty">
                                <Weight size={40} />

                                <h3>No measurements yet</h3>

                                <p>
                                    No weight measurements have been recorded.
                                </p>
                            </div>
                        ) : (
                            <div className="weight-measurements">
                                {sortedMeasurements.map(
                                    (measurement) => (
                                        <div
                                            className="weight-measurement"
                                            key={measurement.id}
                                        >
                                            <div className="weight-measurement-icon">
                                                <Weight size={22} />
                                            </div>

                                            <div className="weight-measurement-info">
                                                <strong>
                                                    {measurement.weight} kg
                                                </strong>

                                                <span>
                                                    {formatDate(
                                                        measurement.measuredAt
                                                    )}
                                                </span>
                                            </div>

                                            {isOwner && (
                                                <div className="weight-measurement-actions">
                                                    <button
                                                        className="secondary-button"
                                                        onClick={() =>
                                                            handleEdit(measurement)
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
                                                            handleDelete(measurement)
                                                        }
                                                        disabled={
                                                            formOpen ||
                                                            deletingId !== null
                                                        }
                                                    >
                                                        <Trash2 size={16} />

                                                        {deletingId === measurement.id
                                                            ? 'Deleting...'
                                                            : 'Delete'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}