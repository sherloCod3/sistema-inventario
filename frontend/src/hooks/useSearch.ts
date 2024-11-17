import { useState, useEffect, useCallback, useMemo } from 'react';
import { InventoryItem } from '../types/inventory';
import _ from 'lodash';

interface UseSearchOptions {
  items: InventoryItem[];
  searchFields: (keyof InventoryItem)[];
  debounceMs?: number;
}

export const useSearch = ({ items, searchFields, debounceMs = 300 }: UseSearchOptions) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>(items);
  const [isSearching, setIsSearching] = useState(false);

  // Memoize a função de busca para evitar recriações
  const performSearch = useCallback((searchValue: string, currentItems: InventoryItem[]) => {
    setIsSearching(true);

    if (!searchValue.trim()) {
      setFilteredItems(currentItems);
      setIsSearching(false);
      return;
    }

    const searchTermLower = searchValue.toLowerCase();

    const results = currentItems.filter(item =>
    searchFields.some(field => {
      const value = String(item[field]).toLowerCase();
      return value.includes(searchTermLower);
    })
    );

    setFilteredItems(results);
    setIsSearching(false);
  }, [searchFields]);

  // Cria versão debounced da busca usando useMemo
  const debouncedSearch = useMemo(
    () => _.debounce(
      (searchValue: string, currentItems: InventoryItem[]) => performSearch(searchValue, currentItems),
                     debounceMs
    ),
    [debounceMs, performSearch]
  );

  // Limpa o debounce quando o componente é desmontado
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Atualiza a busca quando o termo ou items mudam
  useEffect(() => {
    debouncedSearch(searchTerm, items);
  }, [searchTerm, items, debouncedSearch]);

  // Função para limpar a busca
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setFilteredItems(items);
  }, [items]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    isSearching,
    resultCount: filteredItems.length,
    totalCount: items.length,
    hasResults: filteredItems.length > 0,
    clearSearch
  };
};

export default useSearch;
