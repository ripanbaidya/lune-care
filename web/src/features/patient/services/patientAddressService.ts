import { apiClient } from '../../../lib/axios';
import type { ResponseWrapper } from '../../../types/api.types';
import type {
    AddressRequest,
    AddressResponse,
} from '../types/patient-address.types';

export const patientAddressService = {
    getAddress: async (): Promise<ResponseWrapper<AddressResponse>> => {
        const res = await apiClient.get<ResponseWrapper<AddressResponse>>('/patient/addresses');
        return res.data;
    },

    createAddress: async (data: AddressRequest): Promise<ResponseWrapper<AddressResponse>> => {
        const res = await apiClient.post<ResponseWrapper<AddressResponse>>(
            '/patient/addresses',
            data,
        );
        return res.data;
    },

    updateAddress: async (data: AddressRequest): Promise<ResponseWrapper<AddressResponse>> => {
        const res = await apiClient.patch<ResponseWrapper<AddressResponse>>(
            '/patient/addresses',
            data,
        );
        return res.data;
    },

    deleteAddress: async (): Promise<void> => {
        await apiClient.delete('/patient/addresses');
    },
};
