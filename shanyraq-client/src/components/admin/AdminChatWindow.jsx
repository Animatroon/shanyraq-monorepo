// src/components/admin/AdminChatWindow.jsx
import React, { useState, useRef, useEffect } from 'react';
import Input from '../UI/input/Input';
import Button from '../UI/button/Button';
import './AdminChatWindow.scss';

const AdminChatWindow = ({ messages = [], selectedChat, onSendMessage, loadingMessages, hasMoreMessages, onLoadMore }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null); // Для автоскролла вниз
    const messagesContainerRef = useRef(null); // Для отслеживания скролла вверх

    // Автоскролл вниз при новых сообщениях или выборе чата
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, selectedChat]);

    // Обработка скролла для подгрузки старых сообщений
    const handleScroll = () => {
        if (messagesContainerRef.current && messagesContainerRef.current.scrollTop === 0 && hasMoreMessages && !loadingMessages && onLoadMore) {
             console.log("Loading more messages...");
            onLoadMore();
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (newMessage.trim() && onSendMessage && selectedChat) {
            onSendMessage(selectedChat.clientId, selectedChat.clientType, newMessage.trim());
            setNewMessage('');
        }
    };

    if (!selectedChat) {
        return <div className="admin-chat-window placeholder">Выберите чат для просмотра сообщений</div>;
    }

    return (
        <div className="admin-chat-window">
            <div className="chat-header">
                {selectedChat.clientName || 'Unknown Client'} ({selectedChat.clientType === 'tenant' ? 'Арендатор' : 'Арендодатель'})
            </div>
            <div className="messages-container" ref={messagesContainerRef} onScroll={handleScroll}>
                 {loadingMessages && <div className="loading-indicator">Загрузка сообщений...</div>}
                 {hasMoreMessages && !loadingMessages && <div className="load-more-indicator">Прокрутите вверх для загрузки</div>}
                {messages.map((msg) => (
                    <div key={msg._id} className={`message ${msg.isMy ? 'my-message' : 'other-message'}`}>
                        <div className="message-bubble">
                            <p>{msg.text}</p>
                            <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} /> {/* Элемент для скролла */}
            </div>
            <form className="message-input-form" onSubmit={handleSend}>
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Введите сообщение..."
                    disabled={!selectedChat}
                />
                <Button text="Отправить" type="submit" disabled={!selectedChat || !newMessage.trim()} />
            </form>
        </div>
    );
};

export default AdminChatWindow;