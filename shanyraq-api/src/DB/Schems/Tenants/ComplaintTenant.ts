import mongoose, { Schema, Document } from "mongoose";

export enum ComplaintType {
    HOUSE = 'house',
    LANDLOAD = 'landlords'
}

export enum StatusType {
    ACTIVE = 'active',
    IN_PROCESSING = 'in processing',
    INACTIVE = 'inactive',
}

interface IComplaintTenant extends Document {
    complaintType: ComplaintType;
    objectId: string; 
    tenantId: string;  
    comment: string; 
    status: StatusType;
    createdAt: Date;
    updatedAt: Date;
}

const ComplaintTenantSchema = new Schema<IComplaintTenant>(
    {
        complaintType: {
            type: String,
            enum: ComplaintType,
            required: true,
            default: ComplaintType.LANDLOAD
        },
        objectId: { 
            type: String, 
            required: true 
        },
        tenantId: { 
            type: String, 
            required: true 
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

export const ComplaintTenant = mongoose.model<IComplaintTenant>("Tenant-Complaint", ComplaintTenantSchema);
