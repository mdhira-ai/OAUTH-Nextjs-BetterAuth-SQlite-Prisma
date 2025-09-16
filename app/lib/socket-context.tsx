"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  users: User[];
  audioEnabled: boolean;
  enableAudio: () => Promise<void>;
}
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  error: null,
  users: [],
  audioEnabled: false,
  enableAudio: async () => {},
});


interface SocketProviderProps {
  children: React.ReactNode;
  serverUrl?: string;
  enabled?: boolean; // Allow disabling socket connection
}

interface User {
  id: number;
  status: number; // 0 = offline, 1 = online, 2 = away
  which_page: string;
  socket_id: string;
  connected_at: string;
}


export function SocketProvider({
  children,
  serverUrl = "http://localhost:3001", // Default socket server URL
  enabled = true // Enable by default, but allow disabling
}: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);

  // Function to enable audio notifications (requires user interaction)
  const enableAudio = async (): Promise<void> => {
    try {
      const audio = new Audio('/sound/notification.mp3');
      // Try to play and immediately pause to test if audio is allowed
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      setAudioInstance(audio);
      setAudioEnabled(true);
      console.log('Audio notifications enabled');
    } catch (error) {
      console.warn('Failed to enable audio notifications:', error);
      setAudioEnabled(false);
      throw error;
    }
  };

  // Function to play notification sound
  const playNotificationSound = () => {
    if (!audioEnabled || !audioInstance) {
      console.log('Audio not enabled or not available');
      return;
    }

    try {
      // Clone the audio to allow multiple simultaneous plays
      const audio = audioInstance.cloneNode() as HTMLAudioElement;
      audio.play().catch(err => {
        console.error("Failed to play notification sound:", err);
      });
      audio.loop = true;
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 5000);
    } catch (err) {
      console.error("Failed to play notification sound:", err);
    }
  };


  useEffect(() => {
    // Don't initialize socket if disabled
    if (!enabled) {
      console.log("Socket connection disabled");
      return;
    }

    let socketInstance: Socket | null = null;

    try {
      // Initialize socket connection
      socketInstance = io(serverUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3, // Reduced attempts
        reconnectionDelay: 2000, // Increased delay
        timeout: 5000, // Connection timeout
        forceNew: true,
      });

      // Connection event handlers
      socketInstance.on("connect", () => {
        console.log("Socket connected:", socketInstance?.id);
        setIsConnected(true);
        setError(null);
      });

      socketInstance.on('users_list', (usersList: User[]) => {
        console.log('Received users list:', usersList);
        setUsers(usersList);
      });

      socketInstance.on('users_status_update', (updatedUsers: User[]) => {
        console.log('Users status updated:', updatedUsers);
        setUsers(updatedUsers);
      });

      socketInstance.on("notification", (data: any) => {
        const message = `${data.message} from ${data.from}`;
        toast.info(message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });

        // Play notification sound if audio is enabled
        playNotificationSound();
      });


      socketInstance.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setIsConnected(false);
        if (reason === "io server disconnect") {
          // Server initiated disconnect, try to reconnect
          socketInstance?.connect();
        }
      });

      socketInstance.on("connect_error", (error) => {
        console.warn("Socket connection error:", error.message);
        setError(`Connection failed: Server not available`);
        setIsConnected(false);
      });

      socketInstance.on("reconnect", (attemptNumber) => {
        console.log("Socket reconnected after", attemptNumber, "attempts");
        setError(null);
      });

      socketInstance.on("reconnect_error", (error) => {
        console.warn("Socket reconnection error:", error.message);
        setError(`Reconnection failed: Server not available`);
      });

      socketInstance.on("reconnect_failed", () => {
        console.warn("Socket reconnection failed - giving up");
        setError("Connection failed: Unable to reach server");
      });



      setSocket(socketInstance);
    } catch (err) {
      console.error("Failed to initialize socket:", err);
      setError("Failed to initialize socket connection");
    }

    // Cleanup function
    return () => {
      if (socketInstance) {
        console.log("Cleaning up socket connection");
        socketInstance.removeAllListeners();
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
        setError(null);
      }
    };
  }, [serverUrl, enabled]);

  const value: SocketContextType = {
    socket,
    isConnected,
    error,
    users,
    audioEnabled,
    enableAudio,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

// Custom hook to use the socket context
export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);

  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
}

// Helper hook for emitting events
export function useSocketEmit() {
  const { socket, isConnected } = useSocket();

  const emit = (event: string, data?: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn("Socket is not connected. Cannot emit event:", event);
    }
  };

  return { emit, isConnected };
}

// Helper hook for listening to events
export function useSocketListener(event: string, callback: (data: any) => void) {
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on(event, callback);

      return () => {
        socket.off(event, callback);
      };
    }
  }, [socket, event, callback]);
}