// src/types/inventory.ts
export type InventoryType = 'Computador' | 'Monitor' | 'Telefone' | 'Impressora'; //Adicionado Impressora
export type InventoryStatus = 'Ativo' | 'Em Manutenção' | 'Inativo';
export type InventoryCondition = 'Ótimo' | 'Bom' | 'Regular' | 'Ruim';
export type SortOrder = 'asc' | 'desc';

export interface InventoryFormData {
    type: InventoryType;
    sector: string;
    brand: string;
    model: string;
    status: InventoryStatus;
    condition: InventoryCondition;
}

export interface InventoryItem {
    id: string;
    patrimonyId: string;
    type: InventoryType;
    sector: string;
    brand: string;
    modelName: string;  // Backend usa modelName
    model: string;      // Frontend usa model (alias para modelName)
    status: InventoryStatus;
    condition: InventoryCondition;
    createdAt: string;
    updatedAt: string;
}