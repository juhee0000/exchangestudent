import { createContext, useContext, useEffect, useState } from "react";

interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const newSocket = new WebSocket(wsUrl);

      newSocket.onopen = () => {
        setIsConnected(true);
        // Authenticate with token
        const token = localStorage.getItem("token");
        if (token) {
          newSocket.send(JSON.stringify({ type: "auth", token }));
        }
      };

      newSocket.onclose = () => {
        setIsConnected(false);
      };

      newSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      setSocket(newSocket);

      return () => {
        if (newSocket.readyState === WebSocket.OPEN || newSocket.readyState === WebSocket.CONNECTING) {
          newSocket.close();
        }
      };
    } catch (error) {
      console.error("WebSocket initialization error:", error);
      setIsConnected(false);
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}