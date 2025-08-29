import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

import { testConnection } from './db.js';
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import inventoryRoutes from './routes/inventory.js';
import ordersRoutes from './routes/orders.js';
import staffRoutes from './routes/staff.js';
import suppliersRoutes from './routes/suppliers.js';
import stockMovementsRoutes from './routes/stockMovements.js';
import { runMigrations } from './migrate.js';   // ✅ correct path

const app = express();

// trust proxy so `secure` cookies work behind Railway's proxy
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/stock-movements', stockMovementsRoutes);

// Health
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

// Quick health route
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// Serve built frontend if present, otherwise simple JSON
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
} else {
  app.get('/', (_req, res) =>
    res.json({ name: 'Gabriel Kitchen Management System API', mode: 'api', env: process.env.NODE_ENV || 'development' })
  );
}

const PORT = process.env.PORT || 8080;

(async () => {
  try {
    // Run migrations but DO NOT close the pool here
    await runMigrations();

    await testConnection();
    app.listen(PORT, () => {
      console.log(`🚀 API running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('❌ Fatal startup error:', err);
    process.exit(1);
  }
})();

// Global error handler - put this AFTER you register all /api routes
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = typeof err?.status === "number" ? err.status : 500;
  const payload = {
    error: "server_error",
    message: err?.message || "Internal Server Error",
    path: req.originalUrl,
  };
  console.error("API error:", status, req.method, req.originalUrl, err?.stack || err);
  res.status(status).json(payload);
});
