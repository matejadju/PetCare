import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../api/user.api';
import { getApiError } from '../utils/apiError';

interface DeleteAccountProps {
    onClose: () => void;
}

export default function DeleteAccount({
    onClose,
}: DeleteAccountProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [confirmation, setConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        if (!user || confirmation !== 'DELETE' || loading) {
            return;
        }

        setError('');
        setLoading(true);

        try {
            await userApi.deleteAccount(user.id);

            logout();
            navigate('/login', { replace: true });
        } catch (error) {
            setError(
                getApiError(error, 'Failed to delete account.')
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="profile-card danger-card">
            <div className="profile-card-header">
                <h2>Delete account</h2>

                <button
                    className="icon-button"
                    onClick={onClose}
                    disabled={loading}
                    aria-label="Close delete account form"
                >
                    <X size={22} />
                </button>
            </div>

            <div className="danger-warning">
                <AlertTriangle size={26} />

                <div>
                    <h3>This action cannot be undone.</h3>
                    <p>
                        Your user account will be permanently deleted.
                        You will no longer be able to sign in.
                    </p>
                </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <div className="edit-form-group">
                <label htmlFor="delete-confirmation">
                    Type DELETE to confirm.
                </label>

                <input
                    id="delete-confirmation"
                    value={confirmation}
                    onChange={(e) =>
                        setConfirmation(e.target.value)
                    }
                    placeholder="DELETE"
                    autoComplete="off"
                    disabled={loading}
                />
            </div>

            <div className="profile-actions">
                <button
                    className="secondary-button"
                    onClick={onClose}
                    disabled={loading}
                >
                    Cancel
                </button>

                <button
                    className="danger-button"
                    onClick={handleDelete}
                    disabled={
                        confirmation !== 'DELETE' || loading
                    }
                >
                    <Trash2 size={18} />
                    {loading ? 'Deleting...' : 'Delete account'}
                </button>
            </div>
        </section>
    );
}