import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type {
    User,
    LoginRequest,
    RegisterRequest,
} from '../types/auth';
import { authApi } from '../api/auth.api';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');

            try {
                if (token) {
                    const currentUser = await authApi.getMe();
                    setUser(currentUser);
                }
            } catch {
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        void initializeAuth();
    }, []);

    const login = async (data: LoginRequest) => {
        const response = await authApi.login(data);

        localStorage.setItem('token', response.token);
        setUser(response.user);
    };

    const register = async (data: RegisterRequest) => {
        await authApi.register(data);
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: user !== null,
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}