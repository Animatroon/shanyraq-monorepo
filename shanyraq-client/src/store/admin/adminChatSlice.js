// src/store/admin/adminChatSlice.js
import { create } from 'zustand';
import { getAdminChats, getAdminChatMessages } from '../../api/admin/index';
import { produce } from 'immer';

const initialPagination = { currentPage: 1, totalPages: 1, totalItems: 0, limit: 50 };
const initialChatPagination = { currentPage: 1, totalPages: 1, totalItems: 0, limit: 30 };

export const useAdminChatStore = create((set, get) => ({
    chats: [],
    messages: [],
    selectedChat: null,
    chatPagination: { ...initialChatPagination },
    messagePagination: { ...initialPagination },
    loadingChats: false,
    loadingMessages: false,
    loadingMoreMessages: false,
    hasMoreMessages: false,
    error: null,

    setError: (error) => set({ error }),

    fetchChats: async (page = 1) => {
        const limit = get().chatPagination.limit;
        set({ loadingChats: true, error: null });
        try {
            const data = await getAdminChats(page, limit);
            set({
                chats: data.chats || [],
                chatPagination: {
                    currentPage: data.currentPage || 1,
                    totalPages: data.totalPages || 1,
                    totalItems: data.totalChats || 0,
                    limit: limit
                },
                loadingChats: false,
            });
        } catch (error) {
            console.error("Error fetching admin chats:", error);
            // Сохраняем ошибку в стейт
            set({ error: error.message || 'Не удалось загрузить чаты', loadingChats: false });
        }
    },

    selectChat: (chat) => {
        if (!chat) {
            // Если передали null (например, при размонтировании), просто сбрасываем выбор
             set({ selectedChat: null, messages: [], messagePagination: { ...initialPagination }, hasMoreMessages: false });
             return;
        }
        if (get().selectedChat?._id === chat._id) return; // Не выбираем тот же чат
        set({ selectedChat: chat, messages: [], messagePagination: { ...initialPagination }, hasMoreMessages: false });
        get().fetchMessages(true); // Загружаем сообщения для нового чата
    },

    fetchMessages: async (initialLoad = false) => {
        const { selectedChat, messagePagination, loadingMessages, loadingMoreMessages } = get();
        // Проверка, что есть выбранный чат и не идет уже загрузка
        if (!selectedChat?._id || loadingMessages || loadingMoreMessages) return;

        const pageToLoad = initialLoad ? 1 : messagePagination.currentPage + 1;
        const limit = messagePagination.limit;
        const loadingKey = initialLoad ? 'loadingMessages' : 'loadingMoreMessages';

        set({ [loadingKey]: true, error: null }); // Устанавливаем флаг загрузки

        try {
            // Запрашиваем сообщения с бэкенда
            const data = await getAdminChatMessages(selectedChat._id, pageToLoad, limit);
            set(produce((state) => { // Используем Immer
                const newMessages = data.messages || [];
                // Если первая загрузка - заменяем массив, иначе - добавляем старые сообщения В НАЧАЛО
                state.messages = initialLoad ? newMessages : [...newMessages, ...state.messages];
                state.messagePagination = {
                    currentPage: data.currentPage || 1,
                    totalPages: data.totalPages || 1,
                    totalItems: data.totalMessages || 0,
                    limit: limit,
                };
                state.hasMoreMessages = (data.currentPage || 1) < (data.totalPages || 1);
                state[loadingKey] = false; // Снимаем флаг загрузки
            }));
        } catch (error) {
            console.error(`Error fetching messages for chat ${selectedChat._id}:`, error);
             // Сохраняем ошибку в стейт
            set({ error: error.message || 'Не удалось загрузить сообщения', [loadingKey]: false });
        }
    },

    // Функция для очистки сообщений и выбора чата (например, при размонтировании)
    clearChatData: () => {
        set({
            messages: [],
            selectedChat: null,
            messagePagination: { ...initialPagination },
            hasMoreMessages: false,
            error: null // Также сбрасываем ошибку
        });
        console.log("Admin Chat Data Cleared");
    },

    // Добавление нового сообщения (из сокета или оптимистичное)
    addMessage: (newMessage) => {
         if (!newMessage || !newMessage.chatId) return;
         set(produce((state) => {
             // Обновляем открытый чат
             if (state.selectedChat && state.selectedChat._id === newMessage.chatId) {
                 const messageExists = newMessage._id && state.messages.some(msg => msg._id === newMessage._id);
                 // Добавляем, только если сообщение новое (не дубликат)
                 if (!messageExists) {
                      // Находим индекс для вставки по времени (или просто добавляем в конец)
                      // Простой вариант - добавить в конец
                      state.messages.push(newMessage);
                 } else {
                     // Если сообщение с таким ID уже есть (например, оптимистичное подтвердилось),
                     // можно обновить его данные, убрав флаг isOptimistic
                     const msgIndex = state.messages.findIndex(msg => msg._id === newMessage._id);
                     if (msgIndex !== -1 && state.messages[msgIndex].isOptimistic) {
                          state.messages[msgIndex] = { ...newMessage, isMy: state.messages[msgIndex].isMy }; // Сохраняем isMy
                     }
                 }
             }
             // Обновляем список чатов
             const chatIndex = state.chats.findIndex(chat => chat._id === newMessage.chatId);
             if (chatIndex !== -1) {
                  state.chats[chatIndex].lastMessage = { text: newMessage.text, createdAt: newMessage.createdAt, senderType: newMessage.senderType };
                  state.chats[chatIndex].updatedAt = newMessage.createdAt;
                  const updatedChat = state.chats.splice(chatIndex, 1)[0];
                  state.chats.unshift(updatedChat); // Ставим наверх
             } else {
                  // Если чата нет в списке (очень редкий случай), может, стоит его подгрузить?
                  console.warn(`Received message for chat ${newMessage.chatId}, but chat not found in the list.`);
             }
         }));
    },

    // Оптимистичное добавление
     addOptimisticMessage: (chatId, text, senderId) => {
         const tempId = `temp_${Date.now()}`;
         const optimisticMessage = {
             _id: tempId, chatId, senderId, senderType: 'admin',
             text, createdAt: new Date().toISOString(), isMy: true, isOptimistic: true,
         };
         get().addMessage(optimisticMessage);
         return optimisticMessage; // Возвращаем для передачи tempId на сервер
     },
}));