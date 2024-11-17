import { ReactNode } from 'react';
import { InventoryItem, InventoryFormData } from './inventory';

export interface InventoryFilters {
    type: string;
    status: string;
    sector: string;
}

export interface InventoryContextData {
    items: InventoryItem[];
    allItems: InventoryItem[];
    loading: boolean;
    error: string | null;
    // Paginação
    page: number;
    totalPages: number;
    // Filtros e Busca
    filters: InventoryFilters;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isSearching: boolean;
    resultCount: number;
    totalCount: number;
    clearSearch: () => void;
    updateFilters: (filters: Partial<InventoryFilters>) => void;
    clearFilters: () => void;
    setPage: (page: number) => void;
    // CRUD
    addItem: (item: InventoryFormData) => Promise<InventoryItem>;
    updateItem: (id: string, item: InventoryFormData) => Promise<InventoryItem>;
    deleteItem: (id: string) => Promise<void>;
    // Controles de estado
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    refreshItems: () => Promise<void>;
}

export interface InventoryProviderProps {
    children: ReactNode;
}
