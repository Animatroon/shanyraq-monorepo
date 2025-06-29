import mongoose, { Schema, Document } from "mongoose";


export enum HouseType {
    DOM = 'Dom' , 
    APARTAMENT = 'Apartment'
}

export enum RentalsType {
    MONTHLY = 'monthly',
    DAILY = 'daily',
    HOURLY = 'hourly'
}

export enum CityType {
    ALMATY = 'Алматы',
    ASTANA = 'Астана',
    SHYMKENT = 'Шымкент',
    AKTOBE = 'Актобе',
    KARAGANDA = 'Караганда',
    PAVLODAR = 'Павлодар',
    TARAZ = 'Тараз',
    URALSK = 'Уральск',
    SEMEY = 'Семей',
    KOSTANAY = 'Костанай',
    KOKSHETAU = 'Кокшетау',
    KYZYLORDA = 'Кызылорда',
    PETROPAVLOVSK = 'Петропавловск',
    AKTAU = 'Актау',
    ATYRAU = 'Атырау',
    TALDYKORGAN = 'Талдыкорган',
    EKIBASTUZ = 'Экибастуз',
    RIDDER = 'Риддер',
    TURKESTAN = 'Туркестан',
    ZHEZKAZGAN = 'Жезказган'
  }

interface IHouse extends Document {
    landlordId: string;
    roomCount: number;
    meterSquare: number;
    floor: number;
    city: CityType;
    adress: string;
    price: number;
    description: string;
    type: HouseType;
    rentals: RentalsType;
    createdAt: Date;
    updatedAt: Date;
}

const HouseSchema = new Schema<IHouse>(
  {
    landlordId: {
        type: String, 
        required: true
    },
    roomCount: {
        type: Number, 
        required: true
    },
    meterSquare: {
        type: Number, 
        required: true
    },
    floor: {
        type: Number, 
        required: true
    },
    city: {
        type: String, 
        enum: CityType,
        required: true
    },
    adress: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    description: { 
        type: String 
    },
    type: {
        type: String,
        enum: HouseType,
        required: true 
    },
    rentals: {
        type: String,
        enum: RentalsType,
        required: true 
    }
  },
  { timestamps: true }
);

export const House = mongoose.model<IHouse>("House", HouseSchema);
