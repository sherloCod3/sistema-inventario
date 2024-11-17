import React, { useState } from 'react';
import { Download, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '../common/Button';
import { useToast } from '../../contexts/ToastContext';
import { ExportService } from '../../services/exportService';
import { InventoryItem } from '../../types/inventory';

interface ExportButtonProps {
  items: InventoryItem[];
  className?: string;
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  items,
  className = '',
  disabled = false
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { showToast } = useToast();

  const handleExport = async (format: 'csv' | 'xlsx') => {
    if (items.length === 0) {
      showToast('Não há dados para exportar', 'warning');
      return;
    }

    setIsExporting(true);
    try {
      const menuItem = ExportService.getExportMenuItem(format, items);
      await menuItem.action();
      showToast(`Dados exportados com sucesso para ${format.toUpperCase()}!`, 'success');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      showToast(`Erro ao exportar dados para ${format.toUpperCase()}`, 'error');
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="relative inline-block">
    <Button
    variant="outline"
    onClick={() => setShowMenu(!showMenu)}
    disabled={disabled || isExporting}
    className={`flex items-center space-x-2 ${className}`}
    title={items.length === 0 ? 'Não há dados para exportar' : 'Exportar dados'}
    >
    {isExporting ? (
      <>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Exportando...</span>
      </>
    ) : (
      <>
      <Download className="w-4 h-4" />
      <span>Exportar</span>
      <ChevronDown className="w-4 h-4 ml-1" />
      </>
    )}
    </Button>

    {showMenu && !isExporting && (
      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
      <div className="py-1" role="menu" aria-orientation="vertical">
      <button
      onClick={() => handleExport('csv')}
      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      role="menuitem"
      >
      Exportar CSV
      </button>
      <button
      onClick={() => handleExport('xlsx')}
      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      role="menuitem"
      >
      Exportar Excel
      </button>
      </div>
      </div>
    )}
    </div>
  );
};

export default ExportButton;
