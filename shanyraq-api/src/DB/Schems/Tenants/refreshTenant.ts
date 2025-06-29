import mongoose, { Document, Schema } from "mongoose";

export interface IRefreshTenant extends Document {
    _id: string;
    tenantId: string;
    token: string;
    ipAdress: string;
    isActive: boolean;
    device: string;
    createdAt: Date;
    updatedAt: Date;
}

const RefreshTenantSchema: Schema<IRefreshTenant> = new Schema(
  {
    tenantId: {
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

export const RefreshTenant = mongoose.model<IRefreshTenant>("Tenant-Refresh", RefreshTenantSchema);
