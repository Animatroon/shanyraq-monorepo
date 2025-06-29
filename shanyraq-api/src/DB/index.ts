import mongoose from "mongoose";
import { MONGO_URI } from "../config/env";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: "houseServise",
    });
    console.log("База данных подключена");
  } catch (error) {
    console.error("Ошибка подключения к базе данных:", error);
  }
};
