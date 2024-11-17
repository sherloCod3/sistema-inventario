import { useContext } from 'react';
import { InventoryContext } from '../contexts/InventoryContext';
import { InventoryContextData } from '../types/contexts';

export const useInventory = (): InventoryContextData => {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory deve ser usado dentro de um InventoryProvider');
    }
    return context;
};

export default useInventory;
