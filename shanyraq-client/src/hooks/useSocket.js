// src/hooks/useSocket.js
import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
// Импортируем весь стор, чтобы следить за токеном
import { useAdminAuthStore } from '../store/admin/adminAuthSlice';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4400';

export const useSocket = (userType) => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const socketRef = useRef(null);

    // --- ИЗМЕНЕНИЕ: Получаем весь стор, чтобы следить за токеном ---
    // Подписываемся на ИЗМЕНЕНИЯ токена в сторе
    const token = useAdminAuthStore(state => state.token);
    // --- КОНЕЦ ИЗМЕНЕНИЯ ---

    // Получаем ID админа (нужен будет для некоторых событий, если понадобится)
    // const adminId = useAdminAuthStore(state => state.adminInfo?._id);

    const disconnectSocket = useCallback(() => {
        if (socketRef.current) {
            console.log(`[Socket Hook] Disconnecting socket (${userType})...`);
            socketRef.current.off('connect'); // Убираем ВСЕ слушатели перед дисконнектом
            socketRef.current.off('disconnect');
            socketRef.current.off('connect_error');
            socketRef.current.off('adminMessage'); // Убираем специфичные для приложения
            socketRef.current.off('clientMessageToAdmin');
            socketRef.current.off('newUserMessage');
            socketRef.current.off('chatError');
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        }
    }, [userType]);

    // Функция подключения (не изменилась сильно, но теперь вызывается при смене токена)
    const connectSocket = useCallback(() => {
        // Отключаем старое соединение перед созданием нового
        disconnectSocket();

        const authToken = userType === 'admin' ? token : null; // Пока только админский токен

        if (!authToken) {
            console.log(`[Socket Hook] Cannot connect socket (${userType}): No auth token.`);
            return; // Не подключаемся без токена
        }

        console.log(`[Socket Hook] Attempting to connect socket (${userType}) with token...`);
        socketRef.current = io(SOCKET_URL, {
            auth: {
                token: authToken, // Передаем АКТУАЛЬНЫЙ токен
                userType: userType,
            },
            reconnectionAttempts: 3, // Уменьшим кол-во попыток при ошибке
            reconnectionDelay: 5000, // Увеличим задержку
            transports: ['websocket', 'polling'], // Явно указываем транспорты
        });

        // --- Навешиваем слушатели событий ---
        socketRef.current.on('connect', () => {
            console.log(`[Socket Hook] Socket connected (${userType}): ${socketRef.current.id}`);
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', (reason) => {
            console.log(`[Socket Hook] Socket disconnected (${userType}): ${reason}`);
            setIsConnected(false);
            // Если отключил сервер (например, из-за ошибки токена), не пытаемся переподключиться автоматически
             if (reason === 'io server disconnect') {
                 socketRef.current?.close(); // Закрываем соединение
                 // Можно вызвать logout админа здесь, если причина - ошибка аутентификации
                 // useAdminAuthStore.getState().logout();
             }
        });

        socketRef.current.on('connect_error', (err) => {
            console.error(`[Socket Hook] Socket connection error (${userType}):`, err.message);
            setIsConnected(false);
            // Часто ошибка 'jwt expired' или другая ошибка валидации токена приходит сюда
            // Можно проверить err.message и вызвать logout
            if (err.message.includes('Authentication error')) {
                 // Вероятно, проблема с токеном
                 console.warn("[Socket Hook] Authentication likely failed, triggering logout.");
                 // useAdminAuthStore.getState().logout(); // Вызываем logout
            }
        });

        // Обработчики сообщений (оставляем как было)
        socketRef.current.on('adminMessage', (message) => {
            console.log(`[Socket Hook] Received adminMessage (${userType}):`, message);
            setLastMessage({ type: 'adminMessage', data: message });
        });
        socketRef.current.on('clientMessageToAdmin', (message) => {
            console.log(`[Socket Hook] Received clientMessageToAdmin (${userType}):`, message);
            setLastMessage({ type: 'clientMessageToAdmin', data: message });
        });
        socketRef.current.on('newUserMessage', (message) => {
            console.log(`[Socket Hook] Received notification newUserMessage (${userType}):`, message);
            setLastMessage({ type: 'newUserMessage', data: message });
        });
        socketRef.current.on('chatError', (error) => {
            console.error(`[Socket Hook] Received chatError (${userType}):`, error);
            setLastMessage({ type: 'chatError', data: error });
        });

    }, [token, userType, disconnectSocket]); // Добавляем token в зависимости!

    // --- Основной useEffect для управления подключением ---
    useEffect(() => {
        // Подключаемся, если мы админ и есть токен
        if (userType === 'admin' && token) {
             connectSocket();
        } else {
             // Отключаемся, если нет токена или не админ
             disconnectSocket();
        }

        // Функция очистки при размонтировании или изменении зависимостей
        return () => {
            console.log(`[Socket Hook] Cleanup effect (${userType}). Disconnecting...`);
            disconnectSocket();
        };
    // Теперь зависим от connectSocket и disconnectSocket, которые зависят от token
    }, [connectSocket, disconnectSocket, token, userType]);


    // Функция для отправки сообщения
    const sendMessage = useCallback((eventName, data) => {
        if (socketRef.current && isConnected) {
            console.log(`[Socket Hook] Emitting event '${eventName}' (${userType}):`, data);
            socketRef.current.emit(eventName, data);
        } else {
            console.error(`[Socket Hook] Cannot send message (${userType}): Socket not connected.`);
            // Можно попробовать переподключиться или показать ошибку
            // connectSocket();
        }
    }, [isConnected, userType /*, connectSocket */]); // connectSocket можно добавить, если нужна попытка переподключения

    return { isConnected, lastMessage, sendMessage, socketId: socketRef.current?.id };
};