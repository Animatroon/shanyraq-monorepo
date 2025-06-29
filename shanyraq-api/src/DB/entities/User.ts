// тут я начал писать код для создания сущности пользователя с использованием TypeORM

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum UserRole {
  TENANT = "tenant",
  LANDLORD = "landlord",
  ADMIN = "admin"
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ nullable: true })
  fatherName?: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ unique: true, nullable: true })
  phone?: string;

  @Column({ unique: true, nullable: true })
  iin?: string;

  @Column({ type: "enum", enum: UserRole })
  role!: UserRole;

  @Column({ nullable: true, type: "bytea" })
  ava?: Buffer;

  @Column({ default: false })
  isBlacklisted!: boolean;

  @Column({ nullable: true })
  blacklistReason?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}