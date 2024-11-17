import api from './api';
import { InventoryFormData, InventoryItem } from '../types/inventory';
import { AxiosError } from 'axios';

interface QueryParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    sector?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

class InventoryService {
    private static handleError(error: unknown): never {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || 'Erro desconhecido';
            throw new Error(message);
        }
        throw error instanceof Error ? error : new Error('Erro desconhecido');
    }

    static async getAll(params?: QueryParams) {
        try {
            const response = await api.get('/inventory', { params });
            return {
                ...response.data,
                items: response.data.items.map((item: any) => ({
                    ...item,
                    model: item.modelName // Garante que model está sempre presente
                }))
            };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    static async create(data: InventoryFormData): Promise<InventoryItem> {
        try {
            // Transforma o form data para o formato esperado pelo backend
            const payload = {
                ...data,
                modelName: data.model
            };
            
            const response = await api.post('/inventory', payload);
            return {
                ...response.data,
                model: response.data.modelName // Garante que model está presente
            };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    static async update(id: string, data: InventoryFormData): Promise<InventoryItem> {
        try {
            const payload = {
                ...data,
                modelName: data.model
            };
            
            const response = await api.put(`/inventory/${id}`, payload);
            return {
                ...response.data,
                model: response.data.modelName
            };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    static async delete(id: string): Promise<void> {
        try {
            await api.delete(`/inventory/${id}`);
        } catch (error) {
            throw this.handleError(error);
        }
    }
}

export default InventoryService;