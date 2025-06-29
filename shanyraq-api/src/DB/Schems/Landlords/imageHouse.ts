import mongoose, { Schema, Document } from "mongoose";

interface IHouseImage extends Document {
    houseId: string; 
    filename: string;
    contentType: string;
    data: Buffer;
    createdAt: Date;
    updatedAt: Date;
};

const HouseImageSchema = new Schema<IHouseImage>({
    houseId: { 
        type: String, 
        required: true 
    },
    filename: { 
        type: String, 
        required: true 
    },
    contentType: { 
        type: String, 
        required: true 
    },
    data: { 
        type: Buffer, 
        required: true 
    },
});

export const HouseImage = mongoose.model<IHouseImage>("House-Image", HouseImageSchema);
