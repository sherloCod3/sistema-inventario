import { z } from 'zod';

// Enums para valores permitidos
const ItemType = z.enum(['Computador', 'Monitor', 'Telefone', 'Impressora']); // Adicionado Impressora
const ItemStatus = z.enum(['Ativo', 'Em Manutenção', 'Inativo']);
const ItemCondition = z.enum(['Ótimo', 'Bom', 'Regular', 'Ruim']);

export const inventorySchema = z.object({
    id: z.string()
        .min(1, 'Número do patrimônio é obrigatório')
        .transform(val => val.trim()),

    type: ItemType.describe('Tipo do equipamento'),

    sector: z.string()
        .min(2, 'Setor deve ter pelo menos 2 caracteres')
        .max(50, 'Setor deve ter no máximo 50 caracteres')
        .transform(val => val.trim())
        .transform(val => val.toUpperCase()),

    brand: z.string()
        .min(2, 'Marca deve ter pelo menos 2 caracteres')
        .max(50, 'Marca deve ter no máximo 50 caracteres')
        .transform(val => val.trim())
        .transform(val => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()),

    model: z.string()
        .min(2, 'Modelo deve ter pelo menos 2 caracteres')
        .max(50, 'Modelo deve ter no máximo 50 caracteres')
        .transform(val => val.trim()),

    status: ItemStatus
        .describe('Status do equipamento')
        .default('Ativo'),

    condition: ItemCondition
        .describe('Condição do equipamento')
        .refine(
            (val) => {
                if (val === 'Ruim' && ItemStatus.parse('Ativo')) {
                    return false;
                }
                return true;
            },
            { message: 'Equipamentos em condição Ruim não podem estar Ativos' }
        ),
});

// Tipo gerado pelo Zod
export type InventorySchemaType = z.infer<typeof inventorySchema>;

// Constantes exportadas para uso em outros componentes
export const ITEM_TYPES = Object.values(ItemType.Values);
export const ITEM_STATUS = Object.values(ItemStatus.Values);
export const ITEM_CONDITIONS = Object.values(ItemCondition.Values);