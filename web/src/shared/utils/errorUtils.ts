import axios from 'axios';
import {AppError} from './errorParser.ts';
import type {ErrorResponse} from '../../types/api.types';

export function parseError(error: unknown): AppError {
    if (axios.isAxiosError(error) && error.response?.data) {
        const data = error.response.data as ErrorResponse;
        if (data.success === false && data.error) {
            return new AppError(data.error);
        }
    }

    if (axios.isAxiosError(error) && !error.response) {
        return new AppError({
            type: 'SERVICE_UNAVAILABLE',
            code: 'NETWORK_ERROR',
            message: 'Unable to reach the server. Please check your connection.',
            status: 0,
            timestamp: new Date().toISOString(),
            path: '',
        });
    }

    if (error instanceof AppError) return error;

    return new AppError({
        type: 'INTERNAL',
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred.',
        status: 500,
        timestamp: new Date().toISOString(),
        path: '',
    });
}