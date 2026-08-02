import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { healthRouter } from './routes/health';
import { beersRouter } from './routes/beers';
import { cartRouter } from './routes/cart';
import { ordersRouter } from './routes/orders';
import { authRouter } from './routes/auth';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/beers', beersRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);

// ── Error Handler ─────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🍺 Beer Marketplace API running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
