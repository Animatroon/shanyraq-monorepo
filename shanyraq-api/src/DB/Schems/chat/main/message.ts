import mongoose, { Schema, Document } from "mongoose";

export enum SenderType {
    LANDLOAD = "landlord", 
    TENANT = "tenant"
}

interface IMessage extends Document {
    chatId: string;
    senderType: SenderType;
    senderId: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}
  
const MessageSchema = new Schema<IMessage>(
    {
        chatId: { 
            type: String, 
            required: true 
        },
        senderType: { 
            type: String, 
            enum: SenderType, 
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

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
  