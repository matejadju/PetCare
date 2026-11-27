import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
    ClipboardList,
    MessageSquare,
    Plus,
    Trash2,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { appointmentApi } from '../api/appointment.api';
import { getApiError } from '../utils/apiError';

import type {
    AppointmentNote,
    AppointmentStatus,
} from '../types/appointment';

interface AppointmentNotesProps {
    appointmentId: number;
    status: AppointmentStatus;
}

export default function AppointmentNotes({
    appointmentId,
    status,
}: AppointmentNotesProps) {
    const { user } = useAuth();

    const isVeterinarian = user?.role === 'VETERINARIAN';

    const canAddNotes =
        isVeterinarian && status !== 'cancelled';

    const [notes, setNotes] = useState<AppointmentNote[]>([]);
    const [content, setContent] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        let active = true;

        async function loadNotes() {
            try {
                const data = await appointmentApi.getNotes(
                    appointmentId
                );

                if (active) {
                    setNotes(data);
                }
            } catch (error) {
                if (active) {
                    setError(
                        getApiError(error, 'Failed to load notes.')
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadNotes();

        return () => {
            active = false;
        };
    }, [appointmentId]);

    function formatDate(date: string) {
        return new Date(date).toLocaleString('en-GB', {
            timeZone: 'Europe/Ljubljana',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    async function handleAddNote(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!canAddNotes) return;

        setError('');
        setSuccess('');

        if (!content.trim()) {
            setError('Please enter a note.');
            return;
        }

        try {
            setSaving(true);

            const saved = await appointmentApi.createNote(
                appointmentId,
                {
                    content: content.trim(),
                }
            );

            setNotes(previous => [...previous, saved]);
            setContent('');
            setSuccess('Note added successfully.');
        } catch (error) {
            setError(
                getApiError(error, 'Failed to add note.')
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteNote(note: AppointmentNote) {
        if (!isVeterinarian || note.authorId !== user?.id) {
            return;
        }

        if (!window.confirm('Delete this appointment note?')) {
            return;
        }

        setError('');
        setSuccess('');
        setDeletingId(note.id);

        try {
            await appointmentApi.deleteNote(
                appointmentId,
                note.id
            );

            setNotes(previous =>
                previous.filter(item => item.id !== note.id)
            );

            setSuccess('Note deleted successfully.');
        } catch (error) {
            setError(
                getApiError(error, 'Failed to delete note.')
            );
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <section className="appointment-notes">
            <div className="appointment-notes-heading">
                <ClipboardList size={20} />
                <h3>Appointment notes</h3>

                <span className="appointment-notes-count">
                    {notes.length}
                </span>
            </div>

            {error && (
                <div className="auth-error">{error}</div>
            )}

            {success && (
                <div className="profile-success">{success}</div>
            )}

            {loading ? (
                <p className="appointment-notes-empty">
                    Loading notes...
                </p>
            ) : notes.length === 0 ? (
                <div className="appointment-notes-empty">
                    <MessageSquare size={26} />
                    <p>No appointment notes yet.</p>
                </div>
            ) : (
                <div className="appointment-notes-list">
                    {notes.map(note => (
                        <article
                            className="appointment-note"
                            key={note.id}
                        >
                            <div className="appointment-note-header">
                                <div>
                                    <strong>
                                        {note.authorId === user?.id
                                            ? 'Your note'
                                            : 'Veterinarian note'}
                                    </strong>

                                    <span>
                                        {formatDate(note.createdAt)}
                                    </span>
                                </div>

                                {isVeterinarian &&
                                    note.authorId === user?.id && (
                                        <button
                                            type="button"
                                            className="icon-button vet-delete-button"
                                            aria-label="Delete note"
                                            onClick={() =>
                                                handleDeleteNote(note)
                                            }
                                            disabled={
                                                deletingId !== null ||
                                                saving
                                            }
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    )}
                            </div>

                            <p>{note.content}</p>
                        </article>
                    ))}
                </div>
            )}

            {canAddNotes && !loading && (
                <form
                    className="appointment-note-form"
                    onSubmit={handleAddNote}
                >
                    <div className="edit-form-group">
                        <label htmlFor={`note-${appointmentId}`}>
                            Add a new note
                        </label>

                        <textarea
                            id={`note-${appointmentId}`}
                            value={content}
                            onChange={event =>
                                setContent(event.target.value)
                            }
                            placeholder="Enter examination findings, recommendations or additional information..."
                            rows={4}
                            maxLength={2000}
                            disabled={saving}
                            required
                        />

                        <span className="appointment-note-counter">
                            {content.length}/2000
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={
                            saving ||
                            !content.trim() ||
                            deletingId !== null
                        }
                    >
                        <Plus size={17} />
                        {saving ? 'Adding...' : 'Add note'}
                    </button>
                </form>
            )}

            {isVeterinarian && status === 'cancelled' && (
                <p className="availability-hint">
                    New notes cannot be added to cancelled
                    appointments.
                </p>
            )}
        </section>
    );
}