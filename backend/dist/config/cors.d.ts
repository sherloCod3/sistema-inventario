import cors from 'cors';
import { Application } from 'express';
export declare const corsOptions: cors.CorsOptions;
export declare const corsMiddleware: (app: Application) => void;
