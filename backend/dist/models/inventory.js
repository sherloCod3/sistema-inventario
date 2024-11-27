"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryModel = void 0;
const mongoose_1 = require("mongoose");
const sequenceService_1 = require("../services/sequenceService");
const inventorySchema = new mongoose_1.Schema({
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
inventorySchema.pre('save', async function (next) {
    try {
        if (!this.isNew || this.patrimonyId) {
            // Se não é novo documento ou já tem patrimonyId, continua
            return next();
        }
        // Gera novo patrimonyId apenas se não foi fornecido
        this.patrimonyId = await (0, sequenceService_1.getNextPatrimonyId)();
        // Validações de negócio
        if (this.condition === 'Ruim' && this.status === 'Ativo') {
            throw new Error('Items em condição Ruim não podem estar Ativos');
        }
        if (this.status === 'Em Manutenção' && this.condition === 'Ótimo') {
            throw new Error('Items em Manutenção não podem estar em condição Ótima');
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
// Método estático para busca por patrimonyId
inventorySchema.static('findByPatrimonyId', function (patrimonyId) {
    return this.findOne({ patrimonyId });
});
// Índices
inventorySchema.index({ patrimonyId: 1 }, { unique: true });
inventorySchema.index({ type: 1, status: 1 });
inventorySchema.index({ sector: 1 });
inventorySchema.index({ createdAt: -1 });
exports.InventoryModel = (0, mongoose_1.model)('Inventory', inventorySchema);
//# sourceMappingURL=inventory.js.map