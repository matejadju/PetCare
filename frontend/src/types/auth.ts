export type UserRole = 'OWNER' | 'VETERINARIAN';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    phone: string | null;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface LoginResponse {
    token: string;
    tokenType: string;
    user: User;
}

export interface UpdateUserRequest {
    name?: string;
    phone?: string | null;
    avatarUrl?: string | null;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateUserResponse {
    message: string;
    user: User;
}

export interface MessageResponse {
    message: string;
}