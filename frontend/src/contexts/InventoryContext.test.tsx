import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { InventoryProvider } from '../contexts/InventoryContext';
import { useInventory } from '../hooks/useInventory';
import { ToastProvider } from '../contexts/ToastContext';
import { InventoryFormData, InventoryType, InventoryStatus, InventoryCondition } from '../types/inventory';

const mockInventoryData = {
  items: [
    {
      id: 'PAT001',
      type: 'Computador' as InventoryType,
      sector: 'TI',
      brand: 'Dell',
      model: 'Optiplex 7090',
      status: 'Ativo' as InventoryStatus,
      condition: 'Bom' as InventoryCondition,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  totalPages: 1,
  totalItems: 1
};

const createMockFormData = (override: Partial<InventoryFormData> = {}): InventoryFormData => ({
  type: 'Monitor' as InventoryType,
  sector: 'RH',
  brand: 'LG',
  model: '24MK430H',
  status: 'Ativo' as InventoryStatus,
  condition: 'Regular' as InventoryCondition,
  ...override
});

// Mock do serviço de inventário
jest.mock('../services/inventoryService', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(() => Promise.resolve(mockInventoryData)),
    create: jest.fn((data: InventoryFormData) => 
      Promise.resolve({ ...data, id: 'PAT002', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    ),
    update: jest.fn((id: string, data: InventoryFormData) => 
      Promise.resolve({ ...data, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    ),
    delete: jest.fn(() => Promise.resolve()),
  }
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <InventoryProvider>
      {children}
    </InventoryProvider>
  </ToastProvider>
);

describe('InventoryContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial state', async () => {
    const { result } = renderHook(() => useInventory(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.items).toEqual(mockInventoryData.items);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('handles adding new item', async () => {
    const { result } = renderHook(() => useInventory(), { wrapper });
    const newItem = createMockFormData();

    await act(async () => {
      await result.current.addItem(newItem);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('handles updating item', async () => {
    const { result } = renderHook(() => useInventory(), { wrapper });
    const updatedItem = createMockFormData({
      type: 'Computador',
      sector: 'TI',
      brand: 'Dell',
      model: 'Optiplex 7090',
      status: 'Em Manutenção',
      condition: 'Regular'
    });

    await act(async () => {
      await result.current.updateItem('PAT001', updatedItem);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('handles deleting item', async () => {
    const { result } = renderHook(() => useInventory(), { wrapper });

    await act(async () => {
      await result.current.deleteItem('PAT001');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('handles search filtering', async () => {
    const { result } = renderHook(() => useInventory(), { wrapper });

    await act(async () => {
      result.current.setSearchTerm('Dell');
    });

    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].brand).toBe('Dell');
  });

  it('handles filter updates', async () => {
    const { result } = renderHook(() => useInventory(), { wrapper });

    await act(async () => {
      result.current.updateFilters({ type: 'Computador' as const });
    });

    expect(result.current.filters.type).toBe('Computador');
  });

  it('handles error states', async () => {
    const mockError = new Error('Failed to fetch');
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Silencia logs de erro
    
    // Força um erro no serviço
    const inventoryService = require('../services/inventoryService').default;
    inventoryService.getAll.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useInventory(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe(mockError.message);
    expect(result.current.loading).toBe(false);
  });

  it('handles filter clearing', async () => {
    const { result } = renderHook(() => useInventory(), { wrapper });

    await act(async () => {
      result.current.updateFilters({ type: 'Computador' as const });
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({
      type: '',
      status: '',
      sector: ''
    });
  });

  it('handles pagination', async () => {
    const { result } = renderHook(() => useInventory(), { wrapper });

    await act(async () => {
      result.current.setPage(2);
    });

    expect(result.current.page).toBe(2);
  });

  it('resets pagination when applying filters', async () => {
    const { result } = renderHook(() => useInventory(), { wrapper });

    await act(async () => {
      result.current.setPage(2);
      result.current.updateFilters({ type: 'Computador' as const });
    });

    expect(result.current.page).toBe(1);
  });
});