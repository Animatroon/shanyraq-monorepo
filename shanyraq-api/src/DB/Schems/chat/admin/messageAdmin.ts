import mongoose, { Schema, Document } from "mongoose";

export enum AdminSenderType {
    LANDLOAD = "landlord", 
    TENANT = "tenant",
    ADMIN = 'admin'
}

interface IMessageAdmin extends Document {
    chatId: string;
    senderType: AdminSenderType;
    senderId: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}
  
const MessageAdminSchema = new Schema<IMessageAdmin>(
    {
        chatId: { 
            type: String, 
            required: true 
        },
        senderType: { 
            type: String, 
            enum: AdminSenderType, 
            required: true 
        },
        senderId: { 
            type: String, 
            required: true 
        },
        text: { 
            type: String, 
            required: true 
        },
    },
    { timestamps: true }
);

export const MessageAdmin = mongoose.model<IMessageAdmin>("Admin-Message", MessageAdminSchema);
  