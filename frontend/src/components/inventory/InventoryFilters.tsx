import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Select } from '../common/Select';
import { useInventory } from '../../hooks/useInventory';
import { useSearch } from '../../hooks/useSearch';

export const InventoryFilters: React.FC = () => {
    const { items } = useInventory();

    const {
        searchTerm,
        setSearchTerm,
        isSearching,
        resultCount,
        totalCount,
        clearSearch
    } = useSearch({
        items,
        searchFields: ['id', 'patrimonyId', 'type', 'sector', 'brand', 'modelName'],
    });

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-2">
                    <div className="relative">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                            isSearching ? 'text-blue-500' : 'text-gray-400'
                        }`} />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por patrimônio, tipo, setor..."
                            className="w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />

                        {isSearching ? (
                            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin" />
                        ) : searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {searchTerm && (
                        <div className="mt-1 text-sm text-gray-500">
                            {resultCount === 0
                                ? 'Nenhum resultado encontrado'
                                : `Mostrando ${resultCount} de ${totalCount} itens`
                            }
                        </div>
                    )}
                </div>

                <Select placeholder="Filtrar por Tipo">
                    <option value="computador">Computador</option>
                    <option value="monitor">Monitor</option>
                    <option value="telefone">Telefone</option>
                </Select>

                <Select placeholder="Filtrar por Status">
                    <option value="ativo">Ativo</option>
                    <option value="manutencao">Em Manutenção</option>
                    <option value="inativo">Inativo</option>
                </Select>
            </div>
        </div>
    );
};