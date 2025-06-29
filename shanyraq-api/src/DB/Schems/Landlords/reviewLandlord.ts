import mongoose, { Schema, Document } from "mongoose";

interface IReviewLandlord extends Document {
    landlordId: string; 
    tenantId: string;  
    rating: number; 
    comment: string; 
    createdAt: Date;
    updatedAt: Date;
}

const ReviewLandlordSchema = new Schema<IReviewLandlord>(
    {
        landlordId: { 
            type: String, 
            required: true 
        },
        tenantId: { 
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

export const ReviewLandlord = mongoose.model<IReviewLandlord>("Landlord-Review", ReviewLandlordSchema);
