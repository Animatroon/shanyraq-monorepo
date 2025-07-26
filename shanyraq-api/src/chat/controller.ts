import { Request, Response } from "express";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URI,
});

export const getMessages = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM messages ORDER BY created_at DESC");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  const { content, userId } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO messages (content, user_id, created_at) VALUES ($1, $2, NOW()) RETURNING *",
      [content, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};