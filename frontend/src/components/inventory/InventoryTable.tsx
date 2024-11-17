import React, { useState } from 'react';
import { Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Select } from '../common/Select';
import { InventoryItem } from '../../types/inventory';
import { ExportButton } from './ExportButton';
import { useInventory } from '../../hooks/useInventory';

// Mapeamento de colunas para tradução e ordenação
const columnConfig = {
  patrimonyId: { label: 'Nº Patrimônio', sortable: true },
  type: { label: 'Tipo', sortable: true },
  sector: { label: 'Setor', sortable: true },
  brand: { label: 'Marca', sortable: true },
  modelName: { label: 'Modelo', sortable: true },
  status: { label: 'Status', sortable: true },
  condition: { label: 'Condição', sortable: true },
  createdAt: { label: 'Data Cadastro', sortable: true },
  updatedAt: { label: 'Última Atualização', sortable: true }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const InventoryTable: React.FC<{
  items: InventoryItem[];
  onEditItem?: (item: InventoryItem) => void;
  onDeleteItem?: (item: InventoryItem) => void;
}> = ({ items = [], onEditItem, onDeleteItem }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'patrimonyId',
    direction: 'asc' as 'asc' | 'desc'
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { loading, error } = useInventory();

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedItems = [...items].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof InventoryItem];
    const bValue = b[sortConfig.key as keyof InventoryItem];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  const totalItems = sortedItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = sortedItems.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800';
      case 'Em Manutenção': return 'bg-yellow-100 text-yellow-800';
      case 'Inativo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Ótimo': return 'text-green-600';
      case 'Bom': return 'text-blue-600';
      case 'Regular': return 'text-yellow-600';
      case 'Ruim': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) return <div className="p-4">Carregando...</div>;
  if (error) return <div className="p-4 text-red-500">Erro: {error}</div>;
  if (!items.length) {
    return (
      <Card>
        <div className="p-4 text-center text-gray-500">
          Nenhum item encontrado
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4 p-4">
        <h2 className="text-lg font-semibold">Sistema de Inventário - UPA Lençóis Paulista - Gestão IDEAS</h2>
        <div className="flex items-center gap-4">
          <Select
            value={itemsPerPage.toString()}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="w-32"
          >
            <option value="5">5 por página</option>
            <option value="10">10 por página</option>
            <option value="20">20 por página</option>
            <option value="50">50 por página</option>
          </Select>
          <ExportButton items={items} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Object.entries(columnConfig).map(([key, config]) => (
                <th
                  key={key}
                  onClick={() => config.sortable && handleSort(key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    config.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {config.label}
                    {config.sortable && (
                      sortConfig.key === key ? (
                        sortConfig.direction === 'asc' ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronsUpDown className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium">{item.patrimonyId}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{item.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.sector}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.brand}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.modelName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`font-medium ${getConditionColor(item.condition)}`}>
                    {item.condition}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(item.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {onEditItem && (
                      <Button
                        variant="ghost"
                        onClick={() => onEditItem(item)}
                        className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Editar item"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    {onDeleteItem && (
                      <Button
                        variant="ghost"
                        onClick={() => onDeleteItem(item)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Excluir item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            Mostrando {startIndex + 1} até {endIndex} de {totalItems} resultados
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'primary' : 'outline'}
              onClick={() => setCurrentPage(page)}
              className="w-10"
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Próximo
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default InventoryTable;