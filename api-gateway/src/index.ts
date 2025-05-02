import 'dotenv/config';
import express, { Response, Request, NextFunction } from 'express';
import { config } from './configs/app.config';
import cors from 'cors';
import helmet from 'helmet';
import proxy from 'express-http-proxy';

import Redis from 'ioredis';
import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';

import logger from './utils/logger';
import errorHandler from './middlewares/errorHandler.middleware';

const app = express();

// Redis connection

const redisClient = new Redis();

// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// const ratelimitOptions = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
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

// app.use(ratelimitOptions);

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Received ${req.method} from ${req.url}`);
  next();
});

const proxyOptions = {
  proxyReqPathResolver: (req: Request) => {
    return req.originalUrl.replace(/^\/v1/, '/api');
  },
  proxyErrorHandler: (err: Error, res: Response, next: NextFunction) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      message: `Internal server error`,
      error: err.message,
    });
  },
};

//setting up proxy for auth service
app.use(
  '/v1/auth',
  proxy(config.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      if (!proxyReqOpts.headers) {
        proxyReqOpts.headers = {};
      }
      proxyReqOpts.headers['Content-Type'] = 'application/json';
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Identity service: ${proxyRes.statusCode}`
      );

      return proxyResData;
    },
  })
);

app.use(errorHandler);

// start up the server
app.listen(config.PORT, () => {
  logger.info(`Server is listening on ${config.PORT} in ${config.NODE_ENV}`);

  logger.info(
    `Identity service is running on port ${config.IDENTITY_SERVICE_URL}`
  );
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at', promise, 'reason:', reason);
});
