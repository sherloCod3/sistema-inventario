"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inventoryControllers_1 = require("../controllers/inventoryControllers");
const router = express_1.default.Router();
// Rotas públicas (por enquanto)
router.get('/', inventoryControllers_1.getInventory);
router.post('/', inventoryControllers_1.createInventory);
exports.default = router;
