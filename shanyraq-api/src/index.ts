import express from "express";
import chatRoutes from "./chat/endpoint/index";
import { connectDB } from "./db/index";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/chat", chatRoutes);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
};

startServer();

