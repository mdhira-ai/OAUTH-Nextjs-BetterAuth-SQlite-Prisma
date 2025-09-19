'use client'
import { useState } from 'react';
import { usePresence } from '@/app/lib/presence-context';
import { useSession } from '@/app/lib/auth-client';

function page() {
    const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const { isOnline, onlineUsers, userCount, isLoading, error } = usePresence();
    const { data: session } = useSession();

    const handleEnableAudio = async () => {
        try {
            // Request audio permission
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioEnabled(true);
            setReceivedMessages(prev => [...prev, "Audio notifications enabled!"]);
        } catch (error) {
            setReceivedMessages(prev => [...prev, "Failed to enable audio notifications. User interaction required."]);
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">Homepage</h1>
                <p className="text-gray-600 mb-6">Welcome to your homepage! This is a basic test page using Tailwind CSS.</p>

                {/* Presence Status */}
                {session && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h2 className="text-lg font-semibold mb-2 text-gray-800">Your Status</h2>
                        <div className="flex items-center space-x-2 mb-2">
                            <div
                                className={`w-3 h-3 rounded-full ${
                                    isLoading ? "bg-yellow-400" : isOnline ? "bg-green-400" : "bg-red-400"
                                }`}
                            />
                            <span className={`font-medium ${
                                isLoading ? "text-yellow-600" : isOnline ? "text-green-600" : "text-red-600"
                            }`}>
                                {isLoading ? "Connecting..." : isOnline ? "You are Online" : "You are Offline"}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Total users online: <span className="font-semibold">{userCount}</span>
                        </p>
                        {error && (
                            <p className="text-sm text-red-600 mt-2">Error: {error}</p>
                        )}
                    </div>
                )}

                {/* Online Users List */}
                {session && onlineUsers.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="text-md font-semibold mb-2 text-gray-800">Online Users</h3>
                        <div className="space-y-1">
                            {onlineUsers.map((user) => (
                                <div key={user.user_id} className="flex items-center space-x-2 text-sm">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span className="text-gray-700">
                                        {user.email || `User ${user.user_id.slice(0, 8)}...`}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                        (online since {new Date(user.online_at).toLocaleTimeString()})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Database Presence Data */}
                {session && (
                    <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                        {/* <div className="flex items-center justify-between mb-2">
                            <h3 className="text-md font-semibold text-gray-800">Database Presence Records</h3>
                            <button
                                onClick={refreshDbPresence}
                                className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                            >
                                Refresh
                            </button>
                        </div> */}
                        {userCount > 0 ? (
                            <div className="space-y-2">
                                {onlineUsers.slice(0, 5).map((user) => (
                                    <div key={user.user_id} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                                        <div>
                                            <span className="font-medium">User: {user.user_id.slice(0, 8)}...</span>
                                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                                user.isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {user.isOnline ? 'Online' : 'Offline'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(user.online_at).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                                {onlineUsers.length > 5 && (
                                    <p className="text-xs text-gray-500">
                                        ...and {onlineUsers.length - 5} more records
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">No presence records found in database</p>
                        )}
                    </div>
                )}

                {/* Audio Control */}
                <div className="mb-4">
                    <button
                        onClick={handleEnableAudio}
                        disabled={audioEnabled}
                        className={`w-full px-4 py-2 rounded-md text-sm font-medium ${audioEnabled
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

            </div>
        </div>
    );
}

export default page;