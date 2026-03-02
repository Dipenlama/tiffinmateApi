import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';
import path from 'path';

import authRoutes from './routes/auth.route';
import adminUserRoute from './routes/admin/user.route';
import adminItemRoute from './routes/admin/item.route';
import adminBookingRoute from './routes/admin/booking.route';
import menuRoute from './routes/menu.route';
import bookingRoute from './routes/booking.route';
import paymentRoute from './routes/payment.route';
import itemRoute from './routes/item.route';

const app: Application = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello world');
});

app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRoute);
app.use('/api/admin/items', adminItemRoute);
app.use('/api/admin/bookings', adminBookingRoute);
app.use('/api/menu', menuRoute);
app.use('/api/bookings', bookingRoute);
app.use('/api/booking', bookingRoute); // alias to support singular path from frontend
app.use('/api/payments', paymentRoute);
app.use('/api/items', itemRoute);

export default app;
