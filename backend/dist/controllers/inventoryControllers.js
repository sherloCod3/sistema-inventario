"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInventory = exports.updateInventory = exports.createInventory = exports.getInventory = void 0;
const inventory_1 = require("../models/inventory");
const logger_1 = require("../config/logger");
const sequenceService_1 = require("../services/sequenceService");
const getInventory = async (req, res) => {
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
                { patrimonyId: searchRegex },
                { type: searchRegex },
                { sector: searchRegex },
                { brand: searchRegex },
                { modelName: searchRegex }
            ];
        }
        const [items, total] = await Promise.all([
            inventory_1.InventoryModel.find(query)
                .select('-__v')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),
            inventory_1.InventoryModel.countDocuments(query)
        ]);
        const mappedItems = items.map(item => ({
            ...item,
            id: item._id.toString(),
            model: item.modelName
        }));
        const totalPages = Math.ceil(total / limit);
        res.json({
            items: mappedItems,
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
};
exports.getInventory = getInventory;
const createInventory = async (req, res) => {
    try {
        // Usa o patrimonyId fornecido ou gera um novo
        const inventoryData = {
            ...req.body,
            patrimonyId: req.body.id || await (0, sequenceService_1.getNextPatrimonyId)(),
            modelName: req.body.model
        };
        const newItem = await inventory_1.InventoryModel.create(inventoryData);
        const responseItem = {
            id: newItem._id.toString(),
            patrimonyId: newItem.patrimonyId,
            type: newItem.type,
            sector: newItem.sector,
            brand: newItem.brand,
            modelName: newItem.modelName,
            model: newItem.modelName,
            status: newItem.status,
            condition: newItem.condition,
            createdAt: newItem.createdAt.toISOString(),
            updatedAt: newItem.updatedAt.toISOString()
        };
        // Log da criação
        logger_1.logger.info(`Item criado: ${responseItem.patrimonyId}`, { item: responseItem });
        res.status(201).json(responseItem);
    }
    catch (error) {
        logger_1.logger.error('Erro ao criar item:', error);
        res.status(400).json({
            message: 'Erro ao criar item no inventário',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
};
exports.createInventory = createInventory;
const updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const existingItem = await inventory_1.InventoryModel.findById(id).lean();
        if (!existingItem) {
            return res.status(404).json({ message: 'Item não encontrado' });
        }
        // Registra mudanças em campos críticos
        const changeLogs = [];
        const criticalFields = ['patrimonyId', 'status', 'condition'];
        criticalFields.forEach((field) => {
            if (req.body[field] && req.body[field] !== existingItem[field]) {
                changeLogs.push({
                    field,
                    oldValue: existingItem[field],
                    newValue: req.body[field],
                    date: new Date()
                });
            }
        });
        // Mescla os dados existentes com as atualizações
        const updatedData = {
            ...existingItem,
            ...req.body,
            modelName: req.body.model || existingItem.modelName
        };
        const item = await inventory_1.InventoryModel.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true }).lean();
        if (!item) {
            return res.status(404).json({ message: 'Item não encontrado' });
        }
        const responseItem = {
            id: item._id.toString(),
            patrimonyId: item.patrimonyId,
            type: item.type,
            sector: item.sector,
            brand: item.brand,
            modelName: item.modelName,
            model: item.modelName,
            status: item.status,
            condition: item.condition,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString()
        };
        // Log das alterações em campos críticos
        if (changeLogs.length > 0) {
            logger_1.logger.info(`Alterações críticas em ${responseItem.patrimonyId}:`, {
                changes: changeLogs,
                item: responseItem
            });
        }
        res.json(responseItem);
    }
    catch (error) {
        logger_1.logger.error('Erro ao atualizar item:', error);
        res.status(400).json({
            message: 'Erro ao atualizar item no inventário',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
};
exports.updateInventory = updateInventory;
const deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await inventory_1.InventoryModel.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item não encontrado' });
        }
        // Log antes da exclusão
        logger_1.logger.info(`Item excluído: ${item.patrimonyId}`, {
            deletedItem: {
                id: item._id.toString(),
                patrimonyId: item.patrimonyId,
                type: item.type,
                status: item.status
            }
        });
        await item.deleteOne();
        res.json({ message: 'Item excluído com sucesso' });
    }
    catch (error) {
        logger_1.logger.error('Erro ao excluir item:', error);
        res.status(500).json({
            message: 'Erro ao excluir item do inventário',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
};
exports.deleteInventory = deleteInventory;
//# sourceMappingURL=inventoryControllers.js.map