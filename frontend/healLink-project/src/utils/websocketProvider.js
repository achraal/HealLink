import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [ws, setWs] = useState(null);
    const [userId, setUserId] = useState(null);

    // 1️⃣ Create WebSocket when the screen mounts
    useEffect(() => {
        const socket = new WebSocket("ws://192.168.100.30:8000/ws"); // Replace with your IP

        socket.onopen = () => {
            console.log("✅ Connected to WebSocket server");

        };

        socket.onmessage = (event) => {
            console.log("📩 Received:", event.data);
            let message = JSON.parse(event.data);
            if (message.type == "welcome") {
                console.log(message.userID);
                setUserId(message.userID);
            }
            if(message.type == "poke"){
                console.log("AAAAAAA")
                Alert.alert("Fellow user : \n",message.data);
            }
            
        };

        socket.onclose = () => {
            console.log("❌ WebSocket closed");
        };

        setWs(socket);

        // 2️⃣ Cleanup when leaving screen
        return () => {
            socket.close();
        };
    }, []);

    // A helper to send messages
    const send = (msg) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(msg);
        }
    };

    return (
        <WebSocketContext.Provider value={{ ws, userId }}>
            {children}
        </WebSocketContext.Provider>
    );
};
