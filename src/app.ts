import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import authRoutes from './routes/auth.route';
import adminUserRoute from './routes/admin/user.route';
import adminItemRoute from './routes/admin/item.route';
import adminBookingRoute from './routes/admin/booking.route';
import menuRoute from './routes/menu.route';
import bookingRoute from './routes/booking.route';
import paymentRoute from './routes/payment.route';
import itemRoute from './routes/item.route';

const app: Application = express();

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello world');
});

app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRoute);
app.use('/api/admin/items', adminItemRoute);
app.use('/api/admin/bookings', adminBookingRoute);
app.use('/api/menu', menuRoute);
app.use('/api/bookings', bookingRoute);
app.use('/api/payments', paymentRoute);
app.use('/api/items', itemRoute);

export default app;
