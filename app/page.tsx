'use client'
import { useSocket } from '@/app/lib/socket-context'
import { useState } from 'react';

function page() {

    const { socket, isConnected, error, audioEnabled, enableAudio } = useSocket();
    const [receivedMessages, setReceivedMessages] = useState<string[]>([]);

    const handleEnableAudio = async () => {
        try {
            await enableAudio();
            setReceivedMessages(prev => [...prev, "Audio notifications enabled!"]);
        } catch (error) {
            setReceivedMessages(prev => [...prev, "Failed to enable audio notifications. User interaction required."]);
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">Homepage</h1>
                <p className="text-gray-600">Welcome to your homepage! This is a basic test page using Tailwind CSS.</p>

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