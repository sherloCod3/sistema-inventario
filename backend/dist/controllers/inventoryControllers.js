"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInventory = exports.getInventory = void 0;
const inventory_1 = require("../models/inventory");
const logger_1 = require("../config/logger");
const getInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const query = {};
        if (req.query.type)
            query.type = req.query.type;
        if (req.query.status)
            query.status = req.query.status;
        if (req.query.sector)
            query.sector = new RegExp(req.query.sector, 'i');
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [
                { type: searchRegex },
                { sector: searchRegex },
                { brand: searchRegex },
                { modelName: searchRegex } // Atualizado para usar modelName
            ];
        }
        const [items, total] = yield Promise.all([
            inventory_1.InventoryModel.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),
            inventory_1.InventoryModel.countDocuments(query)
        ]);
        const totalPages = Math.ceil(total / limit);
        res.json({
            items,
            page,
            totalPages,
            totalItems: total
        });
    }
    catch (error) {
        logger_1.logger.error('Erro ao buscar inventário:', error);
        res.status(500).json({
            message: 'Erro ao buscar itens do inventário',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
exports.getInventory = getInventory;
const createInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inventoryData = yield inventory_1.InventoryModel.create(req.body);
        res.status(201).json(inventoryData);
    }
    catch (error) {
        logger_1.logger.error('Erro ao criar item:', error);
        res.status(400).json({
            message: 'Erro ao criar item no inventário',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
exports.createInventory = createInventory;
