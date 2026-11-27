import axios from 'axios';
import { config } from '../config/env.js';

const healthClient = axios.create({
    baseURL: config.healthServiceUrl,
    timeout: 10000
});

export async function forwardHealthRequest(req, res) {
    try {
        const response = await healthClient.request({
            method: req.method,
            url: req.path,
            data: req.body,
            params: req.query,
            headers: {
                Authorization: req.headers.authorization || ''
            }
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
            detail: 'Health Service is unavailable'
        });
    }
}