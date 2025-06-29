import mongoose, { Schema, Document } from "mongoose";

export enum ClientType {
    LANDLORD = "landlord", 
    TENANT = "tenant"
}

interface IChatAdmin extends Document {
    adminId: string;
    clientId: string;
    clientType: ClientType;
    createdAt: Date;
    updatedAt: Date;
}

const ChatAdminSchema = new Schema<IChatAdmin>(
    {
        adminId: { 
            type: String, 
            required: true 
        },
        clientType: { 
            type: String, 
            enum: ClientType, 
            required: true 
        },
        clientId: { 
            type: String, 
            required: true 
        },


    },
    { timestamps: true }
);

export const ChatAdmin = mongoose.model<IChatAdmin>("Admin-Chat", ChatAdminSchema);
