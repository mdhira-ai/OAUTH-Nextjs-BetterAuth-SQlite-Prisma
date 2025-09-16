'use client'
import { useSession } from "@/app/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "./loading";
import { useSocket } from "../lib/socket-context";

function page() {

    const router = useRouter();
    const { socket, isConnected, error: socketError, users } = useSocket();
    const [friends, setFriends] = useState<any[]>([]);

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

            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">Dashboard</h1>

                {
                    error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            Error: {error.message}
                        </div>
                    )
                }
                <p className="text-gray-600">Welcome to your dashboard! This is a basic test page using Tailwind CSS.</p>
                <div className="mt-4">
                    <h2 className="text-lg font-semibold mb-2 text-gray-800">User Information</h2>
                </div>
                <div className="bg-gray-50 p-4 rounded shadow-sm">
                    <p><strong>Name:</strong> {session.user?.name || "N/A"}</p>
                    <p><strong>Email:</strong> {session.user?.email || "N/A"}</p>

                </div>

                <div className="mt-6">
                    <h1>socket status</h1>
                    {socketError && (
                        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                            Socket Error: {socketError} <br />
                            <span className="text-xs">Start the socket server to enable real-time features.</span>
                        </div>
                    )}
                    <p>Socket is {isConnected ? "connected" : "disconnected"}</p>
                    {socket && <p>Socket ID: {socket.id}</p>}
                </div>



            </div>

        
            {/* Online Users */}
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Online Users</h2>
                    <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                        {users.length}
                    </span>
                </div>
                <div className="space-y-3 h-96 overflow-y-auto">
                    {users ? (
                        users.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${user.status}`}></div>
                                    <div>
                                        <p className="text-sm text-gray-500">ID: {user.socket_id}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {new Date(user.connected_at).toLocaleTimeString()}
                                </div>

                                {
                                    user.status === 1 ? (
                                        <div className="text-sm text-green-600 font-semibold">Online</div>
                                    ) : (
                                        <div className="text-sm text-red-600 font-semibold">Offline</div>
                                    )
                                }

                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No users online</p>
                    )}
                </div>


            </div>
            </div>
        </div>

    );
}

export default page;