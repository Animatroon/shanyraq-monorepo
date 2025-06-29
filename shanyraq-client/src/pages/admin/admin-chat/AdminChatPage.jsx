// src/pages/admin/AdminChatPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
// --- ИЗМЕНЕНИЕ: Импортируем clearChatData ---
import { useAdminChatStore } from '../../../store/admin/adminChatSlice';
// --- КОНЕЦ ИЗМЕНЕНИЯ ---
import { useSocket } from '../../../hooks/useSocket';
import { useAdminAuthStore, selectAdminInfo } from '../../../store/admin/adminAuthSlice';
import AdminChatList from '../../../components/admin/AdminChatList';
import AdminChatWindow from '../../../components/admin/AdminChatWindow';
import AlertModal from '../../../components/UI/alert-modal/AlertModal';
import './AdminChatPage.scss';

const AdminChatPage = () => {
    // Получаем все необходимые данные и функции из стора
    const {
        chats, messages, selectedChat, chatPagination, messagePagination,
        loadingChats, loadingMessages, loadingMoreMessages, hasMoreMessages, error,
        fetchChats, selectChat, addMessage, addOptimisticMessage, fetchMessages, setError,
        clearChatData // Получаем новую функцию
    } = useAdminChatStore();

    const adminInfo = useAdminAuthStore(selectAdminInfo);
    const adminId = adminInfo?._id;

    const { isConnected, lastMessage, sendMessage } = useSocket('admin');

    // Загрузка списка чатов при монтировании
    useEffect(() => {
        fetchChats(1);
         // Функция очистки при размонтировании
         return () => {
             // --- ИЗМЕНЕНИЕ: Вызываем clearChatData ---
             clearChatData();
             // --- КОНЕЦ ИЗМЕНЕНИЯ ---
         };
    // fetchChats и clearChatData стабильны, но selectChat может меняться, если не обернут
    }, [fetchChats, clearChatData]); // Убираем selectChat из зависимостей здесь

    // Обработка входящих сообщений
     useEffect(() => {
         if (lastMessage) {
             console.log('Socket message received:', lastMessage);
             if (lastMessage.type === 'clientMessageToAdmin') {
                 addMessage(lastMessage.data);
             } else if (lastMessage.type === 'adminMessage') {
                  // Проверяем, не является ли это подтверждением нашего оптимистичного сообщения
                  const existingMsg = messages.find(msg => msg._id === lastMessage.data._id || msg.tempId === lastMessage.data.tempId);
                  if (!existingMsg || !existingMsg.isOptimistic) {
                       addMessage(lastMessage.data);
                  } else if (existingMsg.isOptimistic) {
                       // Можно обновить сообщение, убрав флаг isOptimistic, если нужно
                       addMessage({ ...lastMessage.data, isOptimistic: false });
                  }
             }
         }
     }, [lastMessage, addMessage, messages]); // Добавляем messages в зависимости

    // Выбор чата
    const handleSelectChat = useCallback((chat) => {
        selectChat(chat);
    }, [selectChat]); // selectChat из Zustand стабилен

    // Отправка сообщения
    const handleSendMessage = useCallback((clientId, clientType, text) => {
        if (!selectedChat || !adminId || !isConnected) return;
        const optimisticMsg = addOptimisticMessage(selectedChat._id, text, adminId);
        sendMessage('AdminChat', {
            recipient: { id: clientId, type: clientType },
            text: text
            // tempId отправлять не нужно, сервер сам сгенерирует ID
        });
    }, [selectedChat, adminId, isConnected, sendMessage, addOptimisticMessage]);

    // Загрузка старых сообщений
    const handleLoadMoreMessages = useCallback(() => {
        // Передаем false для initialLoad
        if (selectedChat && hasMoreMessages && !loadingMessages && !loadingMoreMessages) {
            fetchMessages(false);
        }
    }, [selectedChat, hasMoreMessages, loadingMessages, loadingMoreMessages, fetchMessages]);

    // Закрытие модалки
    const closeErrorModal = useCallback(() => { setError(null); }, [setError]);

    return (
        <div className="admin-chat-page">
            <div className="chat-list-panel">
                <AdminChatList
                    chats={chats}
                    onSelectChat={handleSelectChat}
                    selectedChatId={selectedChat?._id}
                    loading={loadingChats}
                />
                {/* TODO: Пагинация для чатов, если chatPagination.totalPages > 1 */}
            </div>
            <div className="chat-window-panel">
                <AdminChatWindow
                    messages={messages}
                    selectedChat={selectedChat}
                    onSendMessage={handleSendMessage}
                    // Показываем основной лоадер, только если это первая загрузка И сообщений еще нет
                    loadingMessages={loadingMessages && messages.length === 0}
                    // Показываем лоадер дозагрузки
                    loadingMoreMessages={loadingMoreMessages}
                    hasMoreMessages={hasMoreMessages}
                    onLoadMore={handleLoadMoreMessages}
                />
            </div>
            {/* Показываем ошибку из стора */}
            {error && (<AlertModal message={`Ошибка чата: ${error}`} onClose={closeErrorModal} />)}
        </div>
    );
};

export default AdminChatPage;