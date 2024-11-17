import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface para estender o tipo Request
interface RequestWithUser extends Request {
    user?: jwt.JwtPayload | string;
}

export const authenticateToken = (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ 
            message: 'Acesso negado. Token não fornecido.' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ 
            message: 'Token inválido.' 
        });
    }
};