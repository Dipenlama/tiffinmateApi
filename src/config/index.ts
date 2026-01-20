import dotenv from 'dotenv';
dotenv.config();

export const PORT:number=
process.env.PORT? parseInt(process.env.PORT):5050;
//ensure PORT is a number, a fallbackis not found
//avoid exception is env is missing
export const MONGO_URI: string=
process.env.MONGO_URI || 'mongodb://localhost:27017/tiffinMate';
//fallback to local mongo db if env is missing

//application level CONSTANTS
export const JWT_SECRET: string =
process.env.JWT_SECRET || 'defaultsecret';