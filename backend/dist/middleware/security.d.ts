export declare const rateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const timeoutMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const haltOnTimedout: (req: any, res: any, next: any) => void;
export declare const helmetConfig: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
