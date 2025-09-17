"use client";

import { useSocket, useSocketEmit, useSocketListener } from "../lib/socket-context";
import { useState, useCallback, useEffect } from "react";
import { useSession } from "../lib/auth-client";

export default function SocketExample() {
  const { socket, isConnected, error, audioEnabled, enableAudio, onlineAuthUsers, currentUser, updateCurrentPage } = useSocket();
  const { emit } = useSocketEmit();
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);

  // Update current page when component mounts or route changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      updateCurrentPage(window.location.pathname);
    }
  }, [updateCurrentPage]);

  // Listen for incoming messages
  const handleMessage = useCallback((data: any) => {
    setReceivedMessages(prev => [...prev, `Received: ${JSON.stringify(data)}`]);
  }, []);

  useSocketListener("message", handleMessage);
  useSocketListener("welcome", handleMessage);
  useSocketListener("error", (error: any) => {
    setReceivedMessages(prev => [...prev, `Error: ${error.message}`]);
  });

  const handleEnableAudio = async () => {
    try {
      await enableAudio();
      setReceivedMessages(prev => [...prev, "Audio notifications enabled!"]);
    } catch (error) {
      setReceivedMessages(prev => [...prev, "Failed to enable audio notifications. User interaction required."]);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      emit("message", { text: message, timestamp: new Date().toISOString() });
      setReceivedMessages(prev => [...prev, `Sent: ${message}`]);
      setMessage("");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Socket.IO Client - User Status System</h2>
      
      {/* Connection Status */}
      <div className="mb-6">
        {socket === null && !error ? (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
            <div className="w-2 h-2 rounded-full mr-2 bg-gray-400"></div>
            Socket Disabled
          </div>
        ) : (
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            isConnected 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? "bg-green-400" : "bg-red-400"
            }`}></div>
            {isConnected ? "Connected" : "Disconnected"}
          </div>
        )}
        {socket && (
          <p className="text-sm text-gray-600 mt-1">
            Socket ID: {socket.id}
          </p>
        )}
        {error && (
          <div className="text-sm text-amber-600 mt-1 p-2 bg-amber-50 rounded">
            <strong>Info:</strong> {error}
            <br />
            <span className="text-xs">Start the socket server to enable real-time features.</span>
          </div>
        )}
      </div>

      {/* Current User Info */}
      {currentUser && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Your Status</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><strong>Name:</strong> {currentUser.name || 'Anonymous'}</div>
            <div><strong>Email:</strong> {currentUser.email || 'N/A'}</div>
            <div><strong>Group:</strong> {currentUser.group}</div>
            <div><strong>Status:</strong> {currentUser.status}</div>
            <div><strong>Current Page:</strong> {currentUser.which_page || 'N/A'}</div>
            <div><strong>Connected At:</strong> {currentUser.connect_at ? new Date(currentUser.connect_at).toLocaleTimeString() : 'N/A'}</div>
          </div>
        </div>
      )}

      {/* Authentication Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Authentication Status</h3>
        {session?.user ? (
          <div className="text-sm">
            <div><strong>Logged in as:</strong> {session.user.name || session.user.email}</div>
            <div><strong>User Type:</strong> Authenticated User</div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            <div><strong>Status:</strong> Anonymous User</div>
          </div>
        )}
      </div>

      {/* Online Auth Users */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Online Authenticated Users ({onlineAuthUsers.length})</h3>
        {onlineAuthUsers.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No authenticated users online</p>
        ) : (
          <div className="grid gap-3">
            {onlineAuthUsers.map((user) => (
              <div key={user.id} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div>
                      <div className="font-medium">{user.name || 'Anonymous'}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>Page: {user.which_page || 'Unknown'}</div>
                    <div>Online since: {user.connect_at ? new Date(user.connect_at).toLocaleTimeString() : 'N/A'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audio Control */}
      <div className="mb-4">
        <button
          onClick={handleEnableAudio}
          disabled={audioEnabled}
          className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
            audioEnabled 
              ? "bg-green-100 text-green-800 cursor-not-allowed" 
              : "bg-yellow-500 text-white hover:bg-yellow-600"
          }`}
        >
          {audioEnabled ? "🔊 Audio Notifications Enabled" : "🔇 Enable Audio Notifications"}
        </button>
        <p className="text-xs text-gray-600 mt-1">
          {audioEnabled 
            ? "You will hear sounds when notifications arrive" 
            : "Click to enable sound notifications (requires user interaction)"
          }
        </p>
      </div>

      {/* Message Input */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            disabled={!isConnected || !socket}
          />
          <button
            onClick={sendMessage}
            disabled={!isConnected || !message.trim() || !socket}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>

      {/* Message History */}
      <div className="border border-gray-300 rounded-md p-3 h-64 overflow-y-auto">
        <h3 className="text-sm font-semibold mb-2">Message History:</h3>
        {receivedMessages.length === 0 ? (
          <p className="text-gray-500 text-sm">No messages yet...</p>
        ) : (
          <ul className="space-y-1">
            {receivedMessages.map((msg, index) => (
              <li key={index} className="text-sm font-mono bg-gray-50 p-1 rounded">
                {msg}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}