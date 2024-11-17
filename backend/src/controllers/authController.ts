import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user';
import { logger } from '../config/logger';

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        // Verifica se usuário existe
        const user = await UserModel.findOne({ username }).select('+password');
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
        const token = jwt.sign(
            { 
                id: user._id,
                username: user.username,
                role: user.role 
            },
            process.env.JWT_SECRET as string,
            { 
                expiresIn: '8h' 
            }
        );

        // Log do login bem-sucedido
        logger.info(`Login realizado: ${username}`);

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
    } catch (error) {
        logger.error('Erro no login:', error);
        res.status(500).json({ 
            message: 'Erro interno no servidor' 
        });
    }
};

export const createInitialAdmin = async () => {
    try {
        // Verifica se já existe algum admin
        const adminExists = await UserModel.findOne({ role: 'admin' });
        
        if (!adminExists) {
            // Cria o admin inicial
            await UserModel.create({
                username: 'admin',
                password: 'admin@123', // Será criptografado automaticamente
                name: 'Administrador',
                email: 'admin@ideas.med.br',
                role: 'admin'
            });
            logger.info('Usuário admin inicial criado com sucesso');
        }
    } catch (error) {
        logger.error('Erro ao criar usuário admin inicial:', error);
        throw error;
    }
};