import { useEffect, useState } from 'react';
import {
    HeartPulse,
    Syringe,
    Pill,
    CalendarDays,
    ClipboardList,
} from 'lucide-react';
import { healthApi } from '../api/health.api';
import { getApiError } from '../utils/apiError';
import type { HealthHistory as HealthHistoryData } from '../types/health';
import '../styles/health.css';

export default function HealthHistory() {
    const [history, setHistory] =
        useState<HealthHistoryData | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filter, setFilter] = useState<
        'ALL' | 'VACCINATIONS' | 'MEDICATIONS'
    >('ALL');

    const petId = 'pet-001';

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await healthApi.getHealthHistory(petId);
                setHistory(data);
            } catch (error) {
                setError(
                    getApiError(error, 'Failed to load health history.')
                );
            } finally {
                setLoading(false);
            }
        };

        void loadHistory();
    }, [petId]);

    const formatDate = (date: string | null) => {
        if (!date) return 'Not specified';

        return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const vaccinations = history?.vaccinations || [];
    const medications = history?.medications || [];

    const records = [
        ...vaccinations.map((item) => ({
            id: `vaccination-${item.id}`,
            type: 'VACCINATIONS' as const,
            title: item.vaccine_name,
            date: item.vaccination_date,
            endDate: item.next_due_date,
            description: item.notes,
            dosage: null,
        })),
        ...medications.map((item) => ({
            id: `medication-${item.id}`,
            type: 'MEDICATIONS' as const,
            title: item.medication_name,
            date: item.start_date,
            endDate: item.end_date,
            description: item.instructions,
            dosage: item.dosage,
        })),
    ].sort((a, b) => b.date.localeCompare(a.date));

    const filteredRecords = records.filter(
        (record) => filter === 'ALL' || record.type === filter
    );

    return (
        <div className="health-page">
            <div className="page-heading">
                <h1>Health History</h1>
                <p>
                    View your pet's complete vaccination and
                    medication history.
                </p>
            </div>

            {error && (
                <div className="auth-error">{error}</div>
            )}

            <div className="history-summary-grid">
                <div className="health-summary">
                    <div className="health-summary-icon">
                        <HeartPulse size={28} />
                    </div>
                    <div>
                        <span>Total health records</span>
                        <h2>{records.length}</h2>
                    </div>
                </div>

                <div className="health-summary">
                    <div className="health-summary-icon">
                        <Syringe size={28} />
                    </div>
                    <div>
                        <span>Vaccinations</span>
                        <h2>{vaccinations.length}</h2>
                    </div>
                </div>

                <div className="health-summary">
                    <div className="health-summary-icon">
                        <Pill size={28} />
                    </div>
                    <div>
                        <span>Medications</span>
                        <h2>{medications.length}</h2>
                    </div>
                </div>
            </div>

            <section className="health-records">
                <div className="health-section-heading">
                    <h2>Medical timeline</h2>
                    <p>Pet ID: {petId}</p>
                </div>

                <div className="history-filters">
                    <button
                        className={filter === 'ALL' ? 'active' : ''}
                        onClick={() => setFilter('ALL')}
                    >
                        All records
                    </button>

                    <button
                        className={
                            filter === 'VACCINATIONS' ? 'active' : ''
                        }
                        onClick={() => setFilter('VACCINATIONS')}
                    >
                        <Syringe size={17} />
                        Vaccinations
                    </button>

                    <button
                        className={
                            filter === 'MEDICATIONS' ? 'active' : ''
                        }
                        onClick={() => setFilter('MEDICATIONS')}
                    >
                        <Pill size={17} />
                        Medications
                    </button>
                </div>

                {loading && (
                    <div className="health-empty">
                        Loading health history...
                    </div>
                )}

                {!loading && !error && filteredRecords.length === 0 && (
                    <div className="health-empty">
                        <HeartPulse size={42} />
                        <h3>No health records</h3>
                        <p>Health records will appear here.</p>
                    </div>
                )}

                <div className="history-timeline">
                    {filteredRecords.map((record) => (
                        <article
                            className="history-item"
                            key={record.id}
                        >
                            <div className="history-timeline-icon">
                                {record.type === 'VACCINATIONS'
                                    ? <Syringe size={23} />
                                    : <Pill size={23} />}
                            </div>

                            <div className="history-item-content">
                                <div className="history-item-header">
                                    <div>
                                        <span className="history-type">
                                            {record.type === 'VACCINATIONS'
                                                ? 'Vaccination'
                                                : 'Medication'}
                                        </span>

                                        <h3>{record.title}</h3>
                                    </div>

                                    <span className="history-date">
                                        {formatDate(record.date)}
                                    </span>
                                </div>

                                {record.dosage && (
                                    <div className="health-record-field">
                                        <Pill size={18} />
                                        <div>
                                            <span>Dosage</span>
                                            <strong>{record.dosage}</strong>
                                        </div>
                                    </div>
                                )}

                                <div className="health-record-field">
                                    <CalendarDays size={18} />
                                    <div>
                                        <span>
                                            {record.type === 'VACCINATIONS'
                                                ? 'Next due date'
                                                : 'End date'}
                                        </span>
                                        <strong>
                                            {formatDate(record.endDate)}
                                        </strong>
                                    </div>
                                </div>

                                <div className="health-record-field">
                                    <ClipboardList size={18} />
                                    <div>
                                        <span>
                                            {record.type === 'VACCINATIONS'
                                                ? 'Notes'
                                                : 'Instructions'}
                                        </span>
                                        <strong>
                                            {record.description ||
                                                'No additional information'}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}