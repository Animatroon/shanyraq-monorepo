import express from 'express'
import { connectDB } from './DB'
import { PORT } from './config/env'
import router from './router'
import cookieParser from "cookie-parser";
import cors from 'cors'
import "reflect-metadata";




const app = express()
const allowedOrigins = [
    'http://localhost:3000',
    'https://shanyraq.com.kz'
];

app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
}));
  
app.options('*', cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
        } else {
        callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(cookieParser())
app.use(express.json());
app.use('/api',router)


const main = () => {
    app.listen(PORT,() => {
        console.log(`сервер запущен на порту: ${PORT}`)
    })
}

connectDB().then(main)