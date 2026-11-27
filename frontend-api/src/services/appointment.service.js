import axios from 'axios';
import { config } from '../config/env.js';

const appointmentClient = axios.create({
    baseURL: config.appointmentServiceUrl,
    timeout: 10000,
});

export async function forwardAppointmentRequest(req, res) {
    try {
        const response = await appointmentClient.request({
            method: req.method,
            url: req.path,
            data: req.body,
            params: req.query,
            headers: {
                Authorization: req.headers.authorization || '',
            },
        });

        if (response.status === 204) {
            return res.status(204).end();
        }

        return res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            return res
                .status(error.response.status)
                .json(error.response.data);
        }

        return res.status(503).json({
            detail: 'Appointment Service is unavailable',
        });
    }
}