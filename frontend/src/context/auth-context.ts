import { createContext } from 'react';
import type {
    User,
    LoginRequest,
    RegisterRequest,
} from '../types/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);