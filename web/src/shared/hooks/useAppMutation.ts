import {
    useMutation,
    type UseMutationOptions,
    type UseMutationResult,
} from '@tanstack/react-query';
import {AppError} from '../utils/errorParser';

export function useAppMutation<TData, TVariables = void>(
    options: UseMutationOptions<TData, AppError, TVariables>,
): UseMutationResult<TData, AppError, TVariables> {
    return useMutation<TData, AppError, TVariables>(options);
}