import { Request, Response } from 'express';
export declare const getInventory: (req: Request, res: Response) => Promise<void>;
export declare const createInventory: (req: Request, res: Response) => Promise<void>;
export declare const updateInventory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteInventory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
