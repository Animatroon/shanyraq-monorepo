import mongoose, { Document, Schema } from "mongoose";

export interface IRefreshAdmin extends Document {
    _id: string;
    adminId: string;
    token: string;
    ipAdress: string;
    isActive: boolean;
    device: string;
    createdAt: Date;
    updatedAt: Date;
}

const RefreshAdminSchema: Schema<IRefreshAdmin> = new Schema(
  {
    adminId: {
        type: String, 
        required: true, 
    },
    token: {
        type: String,
        required: true, 
    },
    isActive: {
        type: Boolean,
        required: true, 
        default: true
    },
    ipAdress: {
        type: String,
    },
    device: {
        type: String,
    }
  },
  { timestamps: true } 
);

export const RefreshAdmin = mongoose.model<IRefreshAdmin>("Admin-Refresh", RefreshAdminSchema);
