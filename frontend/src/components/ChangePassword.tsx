import { useState } from 'react';
import type { FormEvent } from 'react';
import { LockKeyhole, Save, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../api/user.api';
import { getApiError } from '../utils/apiError';

interface ChangePasswordProps {
    onClose: () => void;
}

export default function ChangePassword({
    onClose,
}: ChangePasswordProps) {
    const { user } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user) return;

        setError('');
        setSuccess('');

        if (newPassword.length < 8) {
            setError('Password must contain at least 8 characters.');
            return;
        }

        if (new TextEncoder().encode(newPassword).length > 72 ||
            new TextEncoder().encode(currentPassword).length > 72) {
            setError('Password must not exceed 72 bytes.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (currentPassword === newPassword) {
            setError('New password must be different.');
            return;
        }

        setLoading(true);

        try {
            await userApi.changePassword(user.id, {
                currentPassword,
                newPassword,
            });

            setSuccess('Password changed successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setError(getApiError(error, 'Failed to change password.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="profile-card edit-profile-card">
            <div className="profile-card-header">
                <h2>Change password</h2>

                <button
                    className="icon-button"
                    onClick={onClose}
                    disabled={loading}
                    aria-label="Close password form"
                >
                    <X size={22} />
                </button>
            </div>

            <div className="security-description">
                <LockKeyhole size={24} />
                <p>
                    Keep your account secure by using a strong password.
                </p>
            </div>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="profile-success">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="password-form">
                    <div className="edit-form-group">
                        <label htmlFor="current-password">
                            Current password
                        </label>
                        <input
                            id="current-password"
                            type="password"
                            autoComplete="current-password"
                            value={currentPassword}
                            onChange={(e) =>
                                setCurrentPassword(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="new-password">
                            New password
                        </label>
                        <input
                            id="new-password"
                            type="password"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) =>
                                setNewPassword(e.target.value)
                            }
                            minLength={8}
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="confirm-password">
                            Confirm new password
                        </label>
                        <input
                            id="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            required
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
                        Close
                    </button>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Change password'}
                    </button>
                </div>
            </form>
        </section>
    );
}