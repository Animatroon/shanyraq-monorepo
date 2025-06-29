import mongoose, { Schema, Document } from "mongoose";

export enum BlacklistType {
  EMAIL = "email",
  IIN = "iin"
}

interface IBlacklist extends Document {
  value: string; // Email or IIN
  type: BlacklistType;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlacklistSchema = new Schema<IBlacklist>(
  {
    value: {
      type: String,
      required: true,
      unique: true, 
      index: true,
    },
    type: {
      type: String,
      enum: BlacklistType,
      required: true,
    },
    reason: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export const Blacklist = mongoose.model<IBlacklist>("Blacklist", BlacklistSchema);