import { useState } from 'react';
import type { FormEvent } from 'react';
import { Save, X, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../api/user.api';
import { getApiError } from '../utils/apiError';

interface EditProfileProps {
    onClose: () => void;
}

export default function EditProfile({ onClose }: EditProfileProps) {
    const { user, updateUser } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user) return;

        setError('');

        if (avatarUrl.trim() && !avatarUrl.trim().startsWith('https://')) {
            setError('Avatar URL must use HTTPS.');
            return;
        }

        setLoading(true);

        try {
            const updatedUser = await userApi.updateProfile(user.id, {
                name: name.trim(),
                phone: phone.trim() || null,
                avatarUrl: avatarUrl.trim() || null,
            });

            updateUser(updatedUser);
            onClose();
        } catch (error) {
            setError(getApiError(error, 'Failed to update profile.'));
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        if (!user) return;

        setError('');
        setLoading(true);

        try {
            const updatedUser = await userApi.removeAvatar(user.id);

            updateUser(updatedUser);
            setAvatarUrl('');
        } catch (error) {
            setError(getApiError(error, 'Failed to remove avatar.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="profile-card edit-profile-card">
            <div className="profile-card-header">
                <h2>Edit profile</h2>

                <button
                    className="icon-button"
                    onClick={onClose}
                    disabled={loading}
                    aria-label="Close editor"
                >
                    <X size={22} />
                </button>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="edit-avatar-section">
                    <div className="edit-avatar">
                        {avatarUrl.startsWith('https://') ? (
                            <img src={avatarUrl} alt="Avatar preview" />
                        ) : (
                            name.charAt(0).toUpperCase()
                        )}
                    </div>

                    <div>
                        <h3>Profile picture</h3>
                        <p>Add a profile picture using an HTTPS image URL.</p>

                        {user?.avatarUrl && (
                            <button
                                type="button"
                                className="remove-avatar-button"
                                onClick={handleRemoveAvatar}
                                disabled={loading}
                            >
                                <Trash2 size={16} />
                                Remove picture
                            </button>
                        )}
                    </div>
                </div>

                <div className="edit-form-grid">
                    <div className="edit-form-group">
                        <label htmlFor="edit-name">Full name</label>
                        <input
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            minLength={2}
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="edit-phone">Phone number</label>
                        <input
                            id="edit-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            minLength={5}
                            maxLength={30}
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="edit-email">Email address</label>
                        <input
                            id="edit-email"
                            value={user?.email || ''}
                            disabled
                        />
                    </div>

                    <div className="edit-form-group">
                        <label htmlFor="edit-avatar">Avatar URL</label>
                        <input
                            id="edit-avatar"
                            type="url"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            maxLength={2048}
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
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save changes'}
                    </button>
                </div>
            </form>
        </section>
    );
}