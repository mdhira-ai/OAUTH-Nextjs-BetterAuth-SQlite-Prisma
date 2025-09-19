'use client'
import { useSession } from "@/app/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "./loading";
import { usePresence } from "../lib/presence-context";
import { toast } from "react-toastify";
import { on } from "events";

function page() {

    const router = useRouter();
    const { isOnline, onlineUsers, userCount, isLoading, error: presenceError } = usePresence();
    const [receivedMessages, setReceivedMessages] = useState<string[]>([]);

    const {
        data: session,
        isPending, //loading state
        error, //error object
    } = useSession();


    useEffect(() => {
        if (!isPending && !error && !session) {
            router.replace("/login"); // Use replace instead of push
        }
    }, [session, isPending, error, router]);


    if (isPending) {
        return <Loading />;
    }

    if (!session) {
        return <Loading />;
    }


    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">

                {/* Current User Info */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Your Status</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Name:</strong> {session.user.name || 'Anonymous'}</div>
                        <div><strong>Email:</strong> {session.user.email || 'N/A'}</div>
                        <div><strong>User ID:</strong> {session.user.id}</div>
                        <div className="flex items-center space-x-2">
                            <strong>Status:</strong>
                            <div
                                className={`w-2 h-2 rounded-full ${
                                    isLoading ? "bg-yellow-400" : isOnline ? "bg-green-400" : "bg-red-400"
                                }`}
                            />
                            <span className={`${
                                isLoading ? "text-yellow-600" : isOnline ? "text-green-600" : "text-red-600"
                            }`}>
                                {isLoading ? "Connecting..." : isOnline ? "Online" : "Offline"}
                            </span>
                        </div>
                        <div><strong>Current Page:</strong> Dashboard</div>
                        <div><strong>Connected At:</strong> 
                        {
                            onlineUsers.find(u => u.user_id === session.user.id)?.online_at 
                                ? new Date(onlineUsers.find(u => u.user_id === session.user.id)!.online_at).toLocaleString()
                                : 'Not connected'
                        }
                        
                        </div>
                    </div>
                </div>

                {/* Authentication Status */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Authentication Status</h3>
                    {session?.user ? (
                        <div className="text-sm">
                            <div><strong>Logged in as:</strong> {session.user.name || session.user.email}</div>
                            <div><strong>User Type:</strong> Authenticated User</div>
                            <div><strong>Session Valid:</strong> Yes</div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-600">
                            <div><strong>Status:</strong> Anonymous User</div>
                        </div>
                    )}
                </div>

                {/* Online Users */}
                <div className="mb-6 col-span-1 lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-3">Online Users ({userCount})</h3>
                    {presenceError && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            Error: {presenceError}
                        </div>
                    )}
                    {onlineUsers.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">
                            {isLoading ? "Loading users..." : "No users online"}
                        </p>
                    ) : (
                        <div className="grid gap-3">
                            {onlineUsers.map((user) => (
                                <div key={user.user_id} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                            <div>
                                                <div className="font-medium">
                                                    {user.email || `User ${user.user_id.slice(0, 8)}...`}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    ID: {user.user_id.slice(0, 8)}...
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm text-gray-500">
                                            <div>Online since: {new Date(user.online_at).toLocaleTimeString()}</div>
                                            <div className="text-green-600 font-medium">Active</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default page;