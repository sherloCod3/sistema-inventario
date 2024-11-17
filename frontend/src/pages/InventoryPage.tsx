import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/common/Button';
import { StatusCards } from '../components/inventory/StatusCards';
import { InventoryFilters } from '../components/inventory/InventoryFilters';
import { InventoryTable } from '../components/inventory/InventoryTable';
import InventoryModal from '../components/inventory/InventoryModal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { InventoryPageSkeleton } from '../components/skeletons/LoadingSkeletons';
import { InventoryItem, InventoryFormData } from '../types/inventory';
import { useToast } from '../contexts/ToastContext';
import { useInventory } from '../hooks/useInventory';

const InventoryPage: React.FC = () => {
  const { items, loading, error, addItem, updateItem, deleteItem } = useInventory();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const handleOpenModal = (item?: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(undefined);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteItem(itemToDelete.id);
        showToast('Item excluído com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao deletar:', error);
        showToast('Erro ao excluir item. Tente novamente.', 'error');
      }
    }
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleSubmit = async (formData: InventoryFormData) => {
    try {
      if (editingItem) {
        await updateItem(editingItem.id, formData);
        showToast('Item atualizado com sucesso!', 'success');
      } else {
        await addItem(formData);
        showToast('Item criado com sucesso!', 'success');
      }
      handleCloseModal();
    } catch (err) {
      console.error('Erro ao salvar:', err);
      showToast('Erro ao salvar item. Verifique os dados e tente novamente.', 'error');
    }
  };

  if (loading) {
    return <InventoryPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Inventário
              </h1>
              <p className="text-sm text-gray-600">UPA Lençóis Paulista - Gestão IDEAS</p>
            </div>
            <Button onClick={() => handleOpenModal()} className="whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Novo Item
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <StatusCards />
        <InventoryFilters />
        <InventoryTable
          items={items}
          onEditItem={handleOpenModal}
          onDeleteItem={handleDeleteClick}
        />
      </main>

      <InventoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingItem={editingItem}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir o item ${itemToDelete?.patrimonyId}?`}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
};

export default InventoryPage;