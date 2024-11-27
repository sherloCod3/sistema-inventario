import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
interface RequestWithUser extends Request {
    user?: jwt.JwtPayload | string;
}
export declare const authenticateToken: (req: RequestWithUser, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
