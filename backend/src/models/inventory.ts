import { Document, Model, Schema, model } from 'mongoose';
import { getNextPatrimonyId } from '../services/sequenceService';

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

const inventorySchema = new Schema<InventoryDocument>({
    patrimonyId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Computador', 'Monitor', 'Telefone']
    },
    sector: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    modelName: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Ativo', 'Em Manutenção', 'Inativo'],
        default: 'Ativo'
    },
    condition: {
        type: String,
        required: true,
        enum: ['Ótimo', 'Bom', 'Regular', 'Ruim']
    }
}, {
    timestamps: true,
    collection: 'inventories'
});

// Middleware para gerar patrimonyId automaticamente apenas se não for fornecido
inventorySchema.pre('save', async function(next) {
    try {
        if (!this.isNew || this.patrimonyId) {
            // Se não é novo documento ou já tem patrimonyId, continua
            return next();
        }
        
        // Gera novo patrimonyId apenas se não foi fornecido
        this.patrimonyId = await getNextPatrimonyId();

        // Validações de negócio
        if (this.condition === 'Ruim' && this.status === 'Ativo') {
            throw new Error('Items em condição Ruim não podem estar Ativos');
        }

        if (this.status === 'Em Manutenção' && this.condition === 'Ótimo') {
            throw new Error('Items em Manutenção não podem estar em condição Ótima');
        }

        next();
    } catch (error) {
        next(error as Error);
    }
});

// Método estático para busca por patrimonyId
inventorySchema.static('findByPatrimonyId', function(patrimonyId: string) {
    return this.findOne({ patrimonyId });
});

// Índices
inventorySchema.index({ patrimonyId: 1 }, { unique: true });
inventorySchema.index({ type: 1, status: 1 });
inventorySchema.index({ sector: 1 });
inventorySchema.index({ createdAt: -1 });

export const InventoryModel = model<InventoryDocument, InventoryModel>('Inventory', inventorySchema);