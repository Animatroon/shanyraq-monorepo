import dotenv from 'dotenv'
dotenv.config()

export const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";
export const PORT = process.env.PORT || 5000;
export const PORT_CHAT = process.env.PORT_CHAT || 4300;
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'JWT_ACCESS_SECRET'
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'JWT_REFRESH_SECRET'
export const JWT_ACCESS_EXPIRES = parseInt(process.env.JWT_ACCESS_EXPIRES || '3600')
export const JWT_REFRESH_EXPIRES = parseInt(process.env.JWT_REFRESH_EXPIRES || '604800')
export const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4000'