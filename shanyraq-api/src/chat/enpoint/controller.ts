import { Response } from "express";
import { landlordsRequest } from "../../enpoints/Landlords/jwt";
import { Chat } from "../../DB/Schems/chat/main/chat";
import { Message } from "../../DB/Schems/chat/main/message";
import { userRequest } from "../userRequest";

class MessageController {
    public async getMessages(req: userRequest, res: Response) {
        try {

            const { recipientId, senderType } = req.params
            const userId = req.userId
            
            const chat = await Chat.findOne({
                landlordId: userId,
                tenantId: recipientId
            })  
            
            
            if (!chat) {
                const newChat = await Chat.create({
                    landlordId: userId,
                    tenantId: recipientId
                });
                
                res.json({messages: []})
                return
            }
            const messages = (await Message.find({
                chatId: chat._id,
            })).map((message) => ({
                senderId: message.senderId,
                isMy: message.senderType === senderType,
                text: message.text
            }))
            res.json(messages)
            
        }
        catch (e) {
            res.status(500).json({message: 'ошибка сервера'})
        }
    }
}

export default new MessageController()