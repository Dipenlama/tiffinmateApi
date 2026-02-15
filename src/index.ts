import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './database/mongodb';
import app from './app';
import { PORT } from './config';

async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`server on http://localhost:${PORT}`);
    });
}

startServer();