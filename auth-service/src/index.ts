import 'dotenv/config';
import express, { Response, Request, NextFunction } from 'express';
import { config } from './configs/app.config';
import passport from 'passport';
import './configs/passport.config';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import connectDb from './configs/dB.config';

import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';

import logger from './utils/logger';
import errorHandler from './middlewares/errorHandler.middleware';
import { HTTPSTATUS } from './configs/http.config';
import authRoutes from './routes/auth.routes';

const app = express();

app.use(passport.initialize());

// Database connection
connectDb();

// Redis connection

const redisClient = new Redis();

// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Received ${req.method} from ${req.url}`);
  next();
});

//DDos protection and rate limiting

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: 10,
  duration: 1,
});

app.use((req: Request, res: Response, next: NextFunction) => {
  rateLimiter
    .consume(req.ip as string)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res
        .status(HTTPSTATUS.TOO_MANY_REQUESTS)
        .json({ success: false, message: 'Too many requests' });
    });
});

//Ip based rate limiting for sensitive endpoints

// const sensitiveEndpointsLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 50,
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: (req, res) => {
//     logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
//     res.status(429).json({ success: false, message: 'Too many requests' });
//   },
//   store: new RedisStore({
//     sendCommand: (...args) => redisClient.call(...args),
//   }),
// });

app.get(
  '/api/private',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    console.log('private endPoint hit allowed');
    console.log(req.user?.id);
    res.send('This is a protected route!');
  }
);

app.use('/api/auth', authRoutes);

app.use(errorHandler);

// start up the server
app.listen(config.PORT, () => {
  logger.info(`Server is listening on ${config.PORT} in ${config.NODE_ENV}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at', promise, 'reason:', reason);
});
