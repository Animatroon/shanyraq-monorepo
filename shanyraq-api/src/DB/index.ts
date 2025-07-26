import dotenv from "dotenv";
dotenv.config();

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URI || '',
});

export const connectDB = async () => {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL database');
  } catch (error) {
    console.error('Error connecting to PostgreSQL database:', error);
  }
};

export default pool;