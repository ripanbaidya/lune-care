import {useQueryClient} from '@tanstack/react-query';
import {useAppQuery} from '../../../shared/hooks/useAppQuery';
import {useAppMutation} from '../../../shared/hooks/useAppMutation';
import {patientAddressService} from '../patientAddressService';
import type {AddressRequest, AddressResponse} from '../patient-address.types';
import type {ResponseWrapper} from '../../../types/api.types';
import {AppError} from '../../../shared/utils/errorParser';

export const ADDRESS_QUERY_KEY = ['patient', 'address'] as const;

// Fetch Address
export function usePatientAddress() {
    return useAppQuery<ResponseWrapper<AddressResponse> | null>({
        queryKey: ADDRESS_QUERY_KEY,
        queryFn: async () => {
            try {
                return await patientAddressService.getAddress();
            } catch (err) {
                // 404 means no address yet — treat as empty, not an error
                if (err instanceof AppError && err.status === 404) return null;
                throw err;
            }
        },
    });
}

// Create Address─
export function useCreateAddress() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<AddressResponse>, AddressRequest>({
        mutationFn: (data) => patientAddressService.createAddress(data),
        onSuccess: (res) => {
            qc.setQueryData(ADDRESS_QUERY_KEY, res);
        },
    });
}

// Update Address─
export function useUpdateAddress() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<AddressResponse>, AddressRequest>({
        mutationFn: (data) => patientAddressService.updateAddress(data),
        onSuccess: (res) => {
            qc.setQueryData(ADDRESS_QUERY_KEY, res);
        },
    });
}

// Delete Address─
export function useDeleteAddress() {
    const qc = useQueryClient();
    return useAppMutation<void, void>({
        mutationFn: () => patientAddressService.deleteAddress(),
        onSuccess: () => {
            qc.setQueryData(ADDRESS_QUERY_KEY, null);
        },
    });
}