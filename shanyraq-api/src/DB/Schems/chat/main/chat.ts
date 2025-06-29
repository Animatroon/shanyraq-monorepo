import mongoose, { Schema, Document } from "mongoose";

interface IChat extends Document {
    _id: string;
    landlordId: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
    {
        landlordId: { 
            type: String, 
            required: true 
        },
        tenantId: { 
            type: String, 
            required: true 
        },
    },
    { timestamps: true }
);

export const Chat = mongoose.model<IChat>("Chat", ChatSchema);
