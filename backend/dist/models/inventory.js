"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryModel = void 0;
const mongoose_1 = require("mongoose");
// Schema
const inventorySchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Computador', 'Monitor', 'Telefone']
    },
    sector: {
        type: String,
        required: true,
        trim: true
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
// Middleware para validações
inventorySchema.pre('save', function (next) {
    if (this.condition === 'Ruim' && this.status === 'Ativo') {
        next(new Error('Items em condição Ruim não podem estar Ativos'));
        return;
    }
    if (this.status === 'Em Manutenção' && this.condition === 'Ótimo') {
        next(new Error('Items em Manutenção não podem estar em condição Ótima'));
        return;
    }
    next();
});
// Criação e exportação do modelo
exports.InventoryModel = (0, mongoose_1.model)('Inventory', inventorySchema);
