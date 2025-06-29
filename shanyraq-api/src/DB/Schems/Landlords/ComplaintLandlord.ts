import mongoose, { Schema, Document } from "mongoose";
import { StatusType } from "../Tenants/ComplaintTenant";

export enum ComplaintType {
  LATE_PAYMENT = 'Просрочка платежей', 
  DAMAGE_TO_PROPERTY = 'Порча имущества', 
  BREACH_OF_CONTRACT = 'Нарушение договора', 
  COMPLAINTS_FROM_NEIGHBORS = 'Жалобы соседи',
  OTHER = 'Другое'
}


interface IComplaintLandlord extends Document {
  landlordId: string; 
  tenantsId: string;  
  complaintFor: ComplaintType; 
  comment: string; 
  status: StatusType;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintLandlordSchema = new Schema<IComplaintLandlord>(
  {
    landlordId: { 
      type: String, 
      required: true 
    },
    tenantsId: { 
      type: String, 
      required: true 
    },
    complaintFor: { 
      type: String,
      enum: ComplaintType,
      default: ComplaintType.OTHER, 
      required: true, 
    },
    status: { 
      type: String,
      enum: StatusType, 
      default: StatusType.ACTIVE, 
    },
    comment: { 
      type: String, 
      trim: true 
    },
  },
  { timestamps: true }
);

export const ComplaintLandlord = mongoose.model<IComplaintLandlord>("Landlord-Complaint", ComplaintLandlordSchema);
