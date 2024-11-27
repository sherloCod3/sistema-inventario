"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitialAdmin = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../models/user");
const logger_1 = require("../config/logger");
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        // Verifica se usuário existe
        const user = await user_1.UserModel.findOne({ username }).select('+password');
        if (!user) {
            return res.status(401).json({
                message: 'Usuário ou senha inválidos'
            });
        }
        // Verifica se usuário está ativo
        if (!user.active) {
            return res.status(401).json({
                message: 'Usuário inativo'
            });
        }
        // Verifica a senha
        const isValidPassword = await user.checkPassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: 'Usuário ou senha inválidos'
            });
        }
        // Atualiza último login
        user.lastLogin = new Date();
        await user.save();
        // Gera token JWT
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            username: user.username,
            role: user.role
        }, process.env.JWT_SECRET, {
            expiresIn: '8h'
        });
        // Log do login bem-sucedido
        logger_1.logger.info(`Login realizado: ${username}`);
        // Retorna token e dados do usuário
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Erro no login:', error);
        res.status(500).json({
            message: 'Erro interno no servidor'
        });
    }
};
exports.login = login;
const createInitialAdmin = async () => {
    try {
        // Verifica se já existe algum admin
        const adminExists = await user_1.UserModel.findOne({ role: 'admin' });
        if (!adminExists) {
            // Cria o admin inicial
            await user_1.UserModel.create({
                username: 'admin',
                password: 'admin@123', // Será criptografado automaticamente
                name: 'Administrador',
                email: 'admin@ideas.med.br',
                role: 'admin'
            });
            logger_1.logger.info('Usuário admin inicial criado com sucesso');
        }
    }
    catch (error) {
        logger_1.logger.error('Erro ao criar usuário admin inicial:', error);
        throw error;
    }
};
exports.createInitialAdmin = createInitialAdmin;
//# sourceMappingURL=authController.js.map