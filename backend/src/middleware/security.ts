import rateLimit from 'express-rate-limit';
import timeout from 'connect-timeout';
import helmet from 'helmet';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

export const timeoutMiddleware = timeout('30s');
export const haltOnTimedout = (req: any, res: any, next: any) => {
  if (!req.timedout) next();
};

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 
        /* 'http://localhost:3000',
        'http://inventoryupa.freeddns.org:3000',
        'https://inventoryupa.freeddns.org' */
      ],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});