import React from 'react';
import './AdminChatList.scss';

const AdminChatList = ({ chats = [], onSelectChat, selectedChatId, loading }) => {
    if (loading && chats.length === 0) {
        return <div className="admin-chat-list loading">Загрузка чатов...</div>;
    }

    if (!loading && chats.length === 0) {
         return <div className="admin-chat-list empty">Нет активных чатов.</div>;
    }


    return (
        <ul className="admin-chat-list">
            {chats.map((chat, index) => (
                <li
                    key={chat._id}
                    className={chat._id === selectedChatId ? 'selected' : ''}
                    onClick={() => onSelectChat(chat)}
                    style={{ '--index': index }} 
                >
                    <div className="chat-info">
                        <span className="client-name">{chat.clientName || 'Unknown Client'}</span>
                        <span className="client-type">({chat.clientType === 'tenant' ? 'Арендатор' : 'Арендодатель'})</span>
                    </div>
                    {chat.lastMessage && (
                        <p className="last-message">
                            <span className="sender-prefix">{chat.lastMessage.senderType === 'admin' ? 'Вы: ' : ''}</span>
                            {chat.lastMessage.text.length > 30 ? `${chat.lastMessage.text.substring(0, 30)}...` : chat.lastMessage.text}
                        </p>
                    )}
                    {chat.lastMessage && <span className="chat-time">{new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </li>
            ))}
        </ul>
    );
};

export default AdminChatList;