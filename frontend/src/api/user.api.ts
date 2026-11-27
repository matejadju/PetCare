import api from './axios';
import type {
    User,
    UpdateUserRequest,
    UpdateUserResponse,
    ChangePasswordRequest,
    MessageResponse,
} from '../types/auth';

export const userApi = {
    async updateProfile(
        id: string,
        data: UpdateUserRequest
    ): Promise<User> {
        const response = await api.put<UpdateUserResponse>(
            `/users/${id}`,
            data
        );

        return response.data.user;
    },

    async changePassword(
        id: string,
        data: ChangePasswordRequest
    ): Promise<MessageResponse> {
        const response = await api.put<MessageResponse>(
            `/users/${id}/password`,
            data
        );

        return response.data;
    },

    async removeAvatar(id: string): Promise<User> {
        const response = await api.delete<UpdateUserResponse>(
            `/users/${id}/avatar`
        );

        return response.data.user;
    },

    async deleteAccount(id: string): Promise<void> {
        await api.delete(`/users/${id}`);
    },
};