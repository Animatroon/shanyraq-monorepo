import mongoose, { Schema, Document } from "mongoose";

interface IFavorite extends Document {
  tenantId: string; 
  houseId: string;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    tenantId: { 
      type: String, 
      required: true 
    },
    houseId: { 
      type: String, 
      required: true 
    },
  },
  { timestamps: true }
);

export const Favorite = mongoose.model<IFavorite>("Favorite", FavoriteSchema);
