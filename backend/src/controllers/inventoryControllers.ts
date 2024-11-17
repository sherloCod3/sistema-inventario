import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { InventoryModel, InventoryDocument } from '../models/inventory';
import { logger } from '../config/logger';
import { getNextPatrimonyId } from '../services/sequenceService';

// Interfaces para tipagem
interface ChangeLog {
    field: string;
    oldValue: any;
    newValue: any;
    date: Date;
}

interface InventoryResponse {
    id: string;
    patrimonyId: string;
    type: string;
    sector: string;
    brand: string;
    modelName: string;
    model: string;
    status: string;
    condition: string;
    createdAt: string;
    updatedAt: string;
}

export const getInventory = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const query: Record<string, any> = {};
        
        if (req.query.type) query.type = req.query.type;
        if (req.query.status) query.status = req.query.status;
        if (req.query.sector) query.sector = new RegExp(req.query.sector as string, 'i');

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search as string, 'i');
            query.$or = [
                { patrimonyId: searchRegex },
                { type: searchRegex },
                { sector: searchRegex },
                { brand: searchRegex },
                { modelName: searchRegex }
            ];
        }

        const [items, total] = await Promise.all([
            InventoryModel.find(query)
                .select('-__v')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),
            InventoryModel.countDocuments(query)
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

    } catch (error) {
        logger.error('Erro ao buscar inventário:', error);
        res.status(500).json({ 
            message: 'Erro ao buscar itens do inventário',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
};

export const createInventory = async (req: Request, res: Response) => {
    try {
        // Usa o patrimonyId fornecido ou gera um novo
        const inventoryData = {
            ...req.body,
            patrimonyId: req.body.id || await getNextPatrimonyId(),
            modelName: req.body.model
        };

        const newItem = await InventoryModel.create(inventoryData);


        const responseItem: InventoryResponse = {
            id: (newItem as any)._id.toString(),
            patrimonyId: (newItem as InventoryDocument).patrimonyId,
            type: (newItem as InventoryDocument).type,
            sector: (newItem as InventoryDocument).sector,
            brand: (newItem as InventoryDocument).brand,
            modelName: (newItem as InventoryDocument).modelName,
            model: (newItem as InventoryDocument).modelName,
            status: (newItem as InventoryDocument).status,
            condition: (newItem as InventoryDocument).condition,
            createdAt: (newItem as any).createdAt.toISOString(),
            updatedAt: (newItem as any).updatedAt.toISOString()
        };

        // Log da criação
        logger.info(`Item criado: ${responseItem.patrimonyId}`, { item: responseItem });

        res.status(201).json(responseItem);
    } catch (error) {
        logger.error('Erro ao criar item:', error);
        res.status(400).json({
            message: 'Erro ao criar item no inventário',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
};

export const updateInventory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const existingItem = await InventoryModel.findById(id).lean();
        if (!existingItem) {
            return res.status(404).json({ message: 'Item não encontrado' });
        }

        // Registra mudanças em campos críticos
        const changeLogs: ChangeLog[] = [];
        const criticalFields = ['patrimonyId', 'status', 'condition'] as const;
        type CriticalField = typeof criticalFields[number];
        
        criticalFields.forEach((field: CriticalField) => {
            if (req.body[field] && req.body[field] !== (existingItem as any)[field]) {
                changeLogs.push({
                    field,
                    oldValue: (existingItem as any)[field],
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

        const item = await InventoryModel.findByIdAndUpdate(
            id,
            updatedData,
            { new: true, runValidators: true }
        ).lean();

        if (!item) {
            return res.status(404).json({ message: 'Item não encontrado' });
        }

        const responseItem: InventoryResponse = {
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
            logger.info(`Alterações críticas em ${responseItem.patrimonyId}:`, { 
                changes: changeLogs,
                item: responseItem
            });
        }

        res.json(responseItem);
    } catch (error) {
        logger.error('Erro ao atualizar item:', error);
        res.status(400).json({
            message: 'Erro ao atualizar item no inventário',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
};

export const deleteInventory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const item = await InventoryModel.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item não encontrado' });
        }

         // Log antes da exclusão
         logger.info(`Item excluído: ${(item as InventoryDocument).patrimonyId}`, { 
            deletedItem: {
                id: (item as any)._id.toString(),
                patrimonyId: (item as InventoryDocument).patrimonyId,
                type: (item as InventoryDocument).type,
                status: (item as InventoryDocument).status
            }
        });

        await item.deleteOne();
        
        res.json({ message: 'Item excluído com sucesso' });
    } catch (error) {
        logger.error('Erro ao excluir item:', error);
        res.status(500).json({
            message: 'Erro ao excluir item do inventário',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
};