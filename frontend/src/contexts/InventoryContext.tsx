// src/contexts/InventoryContext.tsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { InventoryItem, InventoryFormData } from '../types/inventory';
import { InventoryContextData, InventoryProviderProps } from '../types/contexts';
import InventoryService from '../services/inventoryService';
import { useSearch } from '../hooks/useSearch';
import { useToast } from './ToastContext';

export const InventoryContext = createContext<InventoryContextData | undefined>(undefined);

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { showToast } = useToast();

    // Mantem o useSearch para buscas rápidas em memória
    const {
        filteredItems,
        searchTerm,
        setSearchTerm,
        isSearching,
        resultCount,
        totalCount,
        clearSearch
    } = useSearch({
        items,
        searchFields: ['id', 'patrimonyId', 'type', 'sector', 'brand', 'modelName']
    });

    // Estados para filtros do backend
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        sector: ''
    });

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Só envia filtros para o backend se não houver busca local
            const response = await InventoryService.getAll({
                ...(searchTerm ? {} : filters),
                                                           page,
                                                           limit: 10
            });

            setItems(response.items);
            setTotalPages(response.totalPages);
        } catch (err) {
            const error = err as Error;
            setError(error.message || 'Erro ao carregar itens');
            showToast(error.message || 'Erro ao carregar itens', 'error');
        } finally {
            setLoading(false);
        }
    }, [filters, page, searchTerm, showToast]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const addItem = async (newItem: InventoryFormData): Promise<InventoryItem> => {
        setLoading(true);
        setError(null);
        try {
            const createdItem = await InventoryService.create(newItem);
            await fetchItems(); // Recarrega a lista após criar
            showToast('Item criado com sucesso!', 'success');
            return createdItem;
        } catch (err) {
            const error = err as Error;
            setError(error.message);
            showToast(error.message, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateItem = async (id: string, updatedItem: InventoryFormData): Promise<InventoryItem> => {
        setLoading(true);
        setError(null);
        try {
            const updated = await InventoryService.update(id, updatedItem);
            await fetchItems(); // Recarrega a lista após atualizar
            showToast('Item atualizado com sucesso!', 'success');
            return updated;
        } catch (err) {
            const error = err as Error;
            setError(error.message);
            showToast(error.message, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (id: string): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            await InventoryService.delete(id);
            await fetchItems(); // Recarrega a lista após deletar
            showToast('Item excluído com sucesso!', 'success');
        } catch (err) {
            const error = err as Error;
            setError(error.message);
            showToast(error.message, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateFilters = (newFilters: Partial<typeof filters>) => {
        setFilters(current => ({
            ...current,
            ...newFilters
        }));
        setPage(1); // Reset para primeira página ao filtrar
    };

    const clearFilters = () => {
        setFilters({
            type: '',
            status: '',
            sector: ''
        });
        clearSearch();
        setPage(1);
    };

    return (
        <InventoryContext.Provider
        value={{
            items: searchTerm ? filteredItems : items,
            allItems: items,
            loading,
            error,
            page,
            totalPages,
            filters,
            searchTerm,
            setSearchTerm,
            isSearching,
            resultCount,
            totalCount,
            clearSearch,
            updateFilters,
            clearFilters,
            setPage,
            addItem,
            updateItem,
            deleteItem,
            setLoading,
            setError,
            refreshItems: fetchItems
        }}
        >
        {children}
        </InventoryContext.Provider>
    );
};
