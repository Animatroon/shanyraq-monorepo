// src/chat/index.ts
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose"; // Импорт Mongoose
import { connectDB } from "../DB";
import { Chat } from "../DB/Schems/chat/main/chat";
import { Message, SenderType } from "../DB/Schems/chat/main/message";
import { ChatAdmin, ClientType } from "../DB/Schems/chat/admin/chatAdmin";
import { MessageAdmin, AdminSenderType } from "../DB/Schems/chat/admin/messageAdmin";
import { JWT_ACCESS_SECRET } from '../config/env';

type UserType = 'landlord' | 'tenant' | 'admin';

const userSockets = new Map<string, string>(); // key: "type:id", value: socket.id
const adminSockets = new Map<string, Set<string>>(); // key: adminId, value: Set<socket.id>

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://shanyraq.com.kz"], 
    methods: ["GET", "POST"],
    credentials: true 
  },
});

io.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    const userType = socket.handshake.auth.userType as UserType | undefined;

    if (!token || !userType) {
        return next(new Error("Auth error: No token or userType"));
    }
    try {
        const decoded: any = jwt.verify(token, JWT_ACCESS_SECRET);
        let userId: string | undefined;
        if (userType === 'admin' && decoded.adminId) userId = decoded.adminId;
        else if (userType === 'tenant' && decoded.tenantsId) userId = decoded.tenantsId;
        else if (userType === 'landlord' && decoded.landlordsId) userId = decoded.landlordsId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) { // Добавлена проверка isValid
            return next(new Error("Auth error: Invalid token payload or ID"));
        }
        (socket as any).userId = userId; (socket as any).userType = userType;
        next();
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Token verification failed';
        next(new Error(`Auth error: ${message}`));
    }
});

io.on("connection", (socket: Socket) => {
  const userId = (socket as any).userId as string;
  const userType = (socket as any).userType as UserType;
  if (!userId || !userType) { socket.disconnect(true); return; }

  console.log(`User connected: ${userType} ${userId} (${socket.id})`);

  // Регистрация сокета
  if (userType === 'admin') {
      if (!adminSockets.has(userId)) adminSockets.set(userId, new Set());
      adminSockets.get(userId)?.add(socket.id);
  } else {
      userSockets.set(`${userType}:${userId}`, socket.id);
  }

  // Клиент <-> Клиент
  socket.on("ClientChat", async (data: { recipient: { id: string; type: UserType }; text: string }) => {
    const sender = { id: userId, type: userType };
    const { recipient, text } = data;
    if (sender.type === 'admin' || (sender.id === recipient.id && sender.type === recipient.type) ||
        !((sender.type === 'landlord' && recipient.type === 'tenant') || (sender.type === 'tenant' && recipient.type === 'landlord')) ||
        !text?.trim()) {
        return; // Игнорируем некорректные запросы
    }
    try {
        const landlordId = sender.type === 'landlord' ? sender.id : recipient.id;
        const tenantId = sender.type === 'tenant' ? sender.id : recipient.id;
        const chat = await Chat.findOneAndUpdate({ landlordId, tenantId }, { $setOnInsert: { landlordId, tenantId } }, { upsert: true, new: true });
        if (!chat) return;
        const newMessage = await Message.create({ chatId: chat._id, senderType: sender.type as SenderType, senderId: sender.id, text: text.trim() });
        const recipientSocketId = userSockets.get(`${recipient.type}:${recipient.id}`);
        if (recipientSocketId) io.to(recipientSocketId).emit("message", { /* ... */ });
        adminSockets.forEach((sockets) => sockets.forEach(id => io.to(id).emit('newUserMessage', { /* ... */ })));
    } catch (error) { console.error("ClientChat Error:", error); socket.emit('chatError', { message: 'Ошибка отправки' }); }
  });

  // Админ <-> Клиент
  socket.on("AdminChat", async (data: { recipient: { id: string; type: ClientType }; text: string }) => {
     const senderAdminId = userId;
     const { recipient, text } = data;
     if (userType !== 'admin' || !recipient?.id || !recipient.type || !Object.values(ClientType).includes(recipient.type) || !text?.trim()) return;
     try {
         let adminChat = await ChatAdmin.findOneAndUpdate({ adminId: senderAdminId, clientId: recipient.id, clientType: recipient.type }, { $setOnInsert: { /* ... */ } }, { upsert: true, new: true });
         if (!adminChat) return;
         const newAdminMessage = await MessageAdmin.create({ chatId: adminChat._id, senderType: AdminSenderType.ADMIN, senderId: senderAdminId, text: text.trim() });
         const recipientSocketId = userSockets.get(`${recipient.type}:${recipient.id}`);
         if (recipientSocketId) io.to(recipientSocketId).emit("adminMessage", { /* ... */ });
         adminSockets.get(senderAdminId)?.forEach(adminSocketId => { if (adminSocketId !== socket.id) io.to(adminSocketId).emit("adminMessage", { /* ... */ }); });
     } catch (error) { console.error("AdminChat Error:", error); socket.emit('chatError', { message: 'Ошибка отправки от админа' }); }
  });

   // Клиент -> Админ
   socket.on("UserToAdminChat", async (data: { text: string }) => {
        const sender = { id: userId, type: userType as ClientType };
        const { text } = data;
        if (userType === 'admin' || !text?.trim()) return;
        try {
             const onlineAdminIds = Array.from(adminSockets.keys());
             if (onlineAdminIds.length === 0) { socket.emit('chatInfo', { message: 'Администраторы оффлайн' }); return; }
             const representativeAdminId = onlineAdminIds[0]; // Берем первого для связи
             let adminChat = await ChatAdmin.findOneAndUpdate({ clientId: sender.id, clientType: sender.type }, { $setOnInsert: { clientId: sender.id, clientType: sender.type, adminId: representativeAdminId } }, { upsert: true, new: true });
             if (!adminChat) return;

            // --- ИСПРАВЛЕНО: Явное преобразование через unknown ---
            const newUserMessageToAdmin = await MessageAdmin.create({
                chatId: adminChat._id,
                senderType: sender.type as unknown as AdminSenderType, // Сначала в unknown, потом в AdminSenderType
                senderId: sender.id,
                text: text.trim(),
            });
            // --- Конец исправления ---

             let sent = false;
             adminSockets.forEach((sockets) => sockets.forEach(id => { io.to(id).emit("clientMessageToAdmin", { /* ... */ }); sent = true; }));
             if (sent) console.log(`Msg from ${sender.type}:${sender.id} sent to admins`);
        } catch (error) { console.error("UserToAdminChat Error:", error); socket.emit('chatError', { message: 'Ошибка отправки админу' }); }
   });

  // Отключение
  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${userType} ${userId} (${socket.id}). Reason: ${reason}`);
    if (userType === 'admin') {
        const adminSet = adminSockets.get(userId);
        if (adminSet) { adminSet.delete(socket.id); if (adminSet.size === 0) adminSockets.delete(userId); }
    } else {
        const key = `${userType}:${userId}`; if (userSockets.get(key) === socket.id) userSockets.delete(key);
    }
  });
});

// --- Запуск ---
connectDB().then(() => {
    const CHAT_PORT_STR = process.env.CHAT_PORT || '4400';
    let CHAT_PORT = parseInt(CHAT_PORT_STR, 10);
    if (isNaN(CHAT_PORT)) { console.error(`Invalid CHAT_PORT: "${CHAT_PORT_STR}". Using 4400.`); CHAT_PORT = 4400; }
    server.listen(CHAT_PORT, '0.0.0.0', () => console.log(`Chat server on port ${CHAT_PORT}`));
}).catch(err => { console.error("DB Connect failed, chat server stopped:", err); process.exit(1); });