import { useState, useEffect } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8004/ws';

export const useWebSocket = (userId: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;

    const newSocket = new WebSocket(WS_URL);

    newSocket.onopen = () => {
      console.log('WebSocket connected');
      newSocket.send(JSON.stringify({ type: 'subscribe', userId }));
    };

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Message from server:', data);
        setMessages(prev => [...prev, data.message]);
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId]);

  return { socket, messages };
};
