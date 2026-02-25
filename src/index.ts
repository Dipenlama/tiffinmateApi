import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './database/mongodb';
import { PORT } from './config';

import authRoutes from './routes/auth.route';
import adminUserRoute from './routes/admin/user.route';
import bookingsRoute from './routes/bookings.route';
import paymentsRoute from './routes/payments.route';
import adminOrdersRoute from './routes/admin/orders.route';

dotenv.config();

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3003')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, cb) => {
            if (!origin) return cb(null, true); // allow curl/postman/server-to-server
            if (allowedOrigins.includes(origin)) return cb(null, true);
            cb(new Error('Not allowed by CORS'));
        },
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// existing routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRoute);
app.use('/api/bookings', bookingsRoute);
app.use('/api/payments', paymentsRoute);
app.use('/api/admin/orders', adminOrdersRoute);

// 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Not found' });
});

// error handler
app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
});

async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });
}

startServer();