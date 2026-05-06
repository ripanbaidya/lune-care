import {
    useQuery,
    type UseQueryOptions,
    type UseQueryResult,
} from '@tanstack/react-query';
import {AppError} from '../utils/errorParser';

export function useAppQuery<TData>(
    options: UseQueryOptions<TData, AppError>,
): UseQueryResult<TData, AppError> {
    return useQuery<TData, AppError>({
        retry: (failureCount, error) => {
            if (error instanceof AppError && !error.isServerError) return false;
            return failureCount < 2;
        },
        ...options,
    });
}