import express, {Application, Request, Response} from 'express';
import { connectDB } from './database/mongodb';
import bodyParser from 'body-parser';
import { PORT } from './config';
import cors from 'cors';

import dotenv from 'dotenv';
dotenv.config();
//can use env variables below this
console.log(process.env.PORT);
//env-> PORT= 5050
import authRoutes from './routes/auth.route';
import adminUserRoute from './routes/admin/user.route';
const app: Application= express();

let corsOptions={
    origin:["http://localhost:3000", "http://localhost:3003"],
    //list of domains allowed to access the server
    //frontend domain/url
}
//origin: "*", allows all domains
app.use(cors(corsOptions));

// const PORT: number = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.get('/', (req: Request, res: Response)=>{
    res.send('Hello world');
});
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRoute);

async function startServer() {
    await connectDB();
    app.listen(
    PORT,
    ()=> {
        console.log(`server on http://localhost:${PORT}`);
    }
    );
    
}
 
startServer()