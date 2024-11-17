import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { InventoryItem } from '../../types/inventory';
import { inventorySchema, InventorySchemaType } from '../../schemas/inventorySchema';
import { useToast } from '../../contexts/ToastContext';

interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: InventorySchemaType) => Promise<void>;
    editingItem?: InventoryItem;
}

const InventoryModal: React.FC<InventoryModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    editingItem
}) => {
    const { showToast } = useToast();
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm<InventorySchemaType>({
        resolver: zodResolver(inventorySchema),
        defaultValues: editingItem ? {
            id: editingItem.patrimonyId,
            type: editingItem.type,
            sector: editingItem.sector,
            brand: editingItem.brand,
            model: editingItem.model,
            status: editingItem.status,
            condition: editingItem.condition
        } : {
            type: undefined,
            sector: '',
            brand: '',
            model: '',
            status: undefined,
            condition: undefined
        }
    });

    // Atualiza o formulário quando o item em edição mudar
    useEffect(() => {
        if (editingItem) {
            Object.entries(editingItem).forEach(([key, value]) => {
                if (key === 'patrimonyId') {
                    setValue('id', value);
                } else if (key === 'model' || key === 'modelName') {
                    setValue('model', value);
                } else {
                    setValue(key as keyof InventorySchemaType, value);
                }
            });
        } else {
            reset();
        }
    }, [editingItem, setValue, reset]);

    const onSubmitForm = async (data: InventorySchemaType) => {
        try {
            // Se estiver editando, mantém os campos não alterados
            const formattedData = editingItem ? {
                ...editingItem,
                ...data,
                sector: data.sector.toUpperCase(),
                model: data.model,
                modelName: data.model
            } : {
                ...data,
                sector: data.sector.toUpperCase()
            };

            await onSubmit(formattedData);
            reset();
            onClose();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar item';
            showToast(errorMessage, 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 m-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        {editingItem ? 'Editar Item' : 'Novo Item'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Patrimônio
                            </label>
                            <input
                                {...register('id')}
                                className={`w-full px-3 py-2 border rounded-lg ${
                                    errors.id ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={!!editingItem}
                            />
                            {errors.id && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.id.message}
                                </p>
                            )}
                        </div>

                        <Select
                            {...register('type')}
                            label="Tipo"
                            error={!!errors.type}
                            errorMessage={errors.type?.message}
                        >
                            <option value="">Selecione um tipo</option>
                            <option value="Computador">Computador</option>
                            <option value="Monitor">Monitor</option>
                            <option value="Telefone">Telefone</option>
                        </Select>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Setor
                            </label>
                            <input
                                {...register('sector')}
                                className={`w-full px-3 py-2 border rounded-lg ${
                                    errors.sector ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.sector && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.sector.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Marca
                            </label>
                            <input
                                {...register('brand')}
                                className={`w-full px-3 py-2 border rounded-lg ${
                                    errors.brand ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.brand && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.brand.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Modelo
                            </label>
                            <input
                                {...register('model')}
                                className={`w-full px-3 py-2 border rounded-lg ${
                                    errors.model ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.model && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.model.message}
                                </p>
                            )}
                        </div>

                        <Select
                            {...register('status')}
                            label="Status"
                            error={!!errors.status}
                            errorMessage={errors.status?.message}
                        >
                            <option value="">Selecione um status</option>
                            <option value="Ativo">Ativo</option>
                            <option value="Em Manutenção">Em Manutenção</option>
                            <option value="Inativo">Inativo</option>
                        </Select>

                        <Select
                            {...register('condition')}
                            label="Condição"
                            error={!!errors.condition}
                            errorMessage={errors.condition?.message}
                        >
                            <option value="">Selecione uma condição</option>
                            <option value="Ótimo">Ótimo</option>
                            <option value="Bom">Bom</option>
                            <option value="Regular">Regular</option>
                            <option value="Ruim">Ruim</option>
                        </Select>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="min-w-[120px]"
                        >
                            {editingItem ? 'Salvar Alterações' : 'Criar Item'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InventoryModal;