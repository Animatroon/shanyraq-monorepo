import mongoose, { Document, Schema, Model } from "mongoose";

export interface ILandlordRefresh extends Document {
    _id: string;
    landlordId: string;
    token: string;
    ipAdress: string;
    isActive: boolean;
    device: string;
    createdAt: Date;
    updatedAt: Date;
}

const LandlordRefreshSchema: Schema<ILandlordRefresh> = new Schema(
  {
    landlordId: {
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

export const RefreshLandlord = mongoose.model<ILandlordRefresh>("Landlord-Refresh", LandlordRefreshSchema);