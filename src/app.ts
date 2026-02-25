import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import authRoutes from './routes/auth.route';
import adminUserRoute from './routes/admin/user.route';

const app: Application = express();

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3003'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello world');
});

app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRoute);

export default app;
