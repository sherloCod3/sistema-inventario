import express from 'express';
import { getInventory, createInventory, updateInventory, deleteInventory } from '../controllers/inventoryControllers';

const router = express.Router();

// Rotas públicas (por enquanto)
router.get('/', getInventory);
router.post('/', createInventory);
router.put('/:id', updateInventory);
router.delete('/:id', deleteInventory);

export default router;