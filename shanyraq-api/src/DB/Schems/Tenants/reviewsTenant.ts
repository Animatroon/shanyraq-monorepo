import mongoose, { Schema, Document } from "mongoose";


export enum ReviewType {
    HOUSE = 'house', 
    LANDLOAD = 'landlord'
}


interface IReviewTenant extends Document {
    reviewType: ReviewType;
    objectId: string; 
    TenantsId: string;  
    rating: number; 
    comment: string; 
    createdAt: Date;
    updatedAt: Date;
}

const ReviewTenantsSchema = new Schema<IReviewTenant>(
    {
        reviewType: {
            type: String,
            enum: ReviewType,
            required: true,
            default: ReviewType.LANDLOAD
        },
        objectId: { 
            type: String, 
            required: true 
        },
        TenantsId: { 
            type: String, 
            required: true 
        },
        rating: { 
            type: Number, 
            required: true, 
            min: 1, 
            max: 5 
        },
        comment: { 
            type: String, 
            trim: true 
        },
    },
    { timestamps: true }
);

export const ReviewTenant = mongoose.model<IReviewTenant>("Tenant-Review", ReviewTenantsSchema);
