import mongoose, { Schema, Document } from "mongoose";

interface IAdmin extends Document {
  _id: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  superadmin: boolean; 
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: true
    },
    surname: {
      type: String,
      required: true
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    superadmin: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

export const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);
