import { Document, Model } from 'mongoose';
export interface Inventory {
    patrimonyId: string;
    type: 'Computador' | 'Monitor' | 'Telefone';
    sector: string;
    brand: string;
    modelName: string;
    status: 'Ativo' | 'Em Manutenção' | 'Inativo';
    condition: 'Ótimo' | 'Bom' | 'Regular' | 'Ruim';
}
export interface InventoryDocument extends Document, Inventory {
    createdAt: Date;
    updatedAt: Date;
}
export interface InventoryModel extends Model<InventoryDocument> {
    findByPatrimonyId(patrimonyId: string): Promise<InventoryDocument | null>;
}
export declare const InventoryModel: InventoryModel;
