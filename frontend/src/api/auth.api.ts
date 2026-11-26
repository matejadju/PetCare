import api from './axios';
import type {
    User,
    LoginRequest,
    RegisterRequest,
    LoginResponse,
} from '../types/auth';

export const authApi = {
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>(
            '/users/login',
            data
        );

        return response.data;
    },

    async register(data: RegisterRequest) {
        const response = await api.post('/users/register', data);
        return response.data;
    },

    async getMe(): Promise<User> {
        const response = await api.get<User>('/users/me');
        return response.data;
    },
};