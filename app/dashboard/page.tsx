'use client'
import { useSession } from "@/app/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "./loading";
import { useSocket, useSocketListener } from "../lib/socket-context";
import { toast } from "react-toastify";

function page() {

    const router = useRouter();
    const [friends, setFriends] = useState<any[]>([]);
    const { socket, isConnected, error: socketError, audioEnabled, enableAudio, onlineAuthUsers, currentUser, updateCurrentPage } = useSocket();
    const [receivedMessages, setReceivedMessages] = useState<string[]>([]);

    const {
        data: session,
        isPending, //loading state
        error, //error object
    } = useSession();


    useEffect(() => {
        if (typeof window !== 'undefined') {
            updateCurrentPage(window.location.pathname);
        }
    }, [updateCurrentPage]);

    useSocketListener("error", (error: any) => {
        setReceivedMessages(prev => [...prev, `Error: ${error.message}`]);
    });


    useSocketListener("poke_from", (data: any) => {
        toast.info(`You got a poke from ${data.fromName}! and email is ${data.fromEmail}`, {
            position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined,
        });

    });



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

    const sendPoke = (userId: string) => {
        if (socket && isConnected) {
            socket.emit("poke", { to: userId });
            // setReceivedMessages(prev => [...prev, `Poked user ID: ${userId}`]);
        } else {
            console.warn("Socket is not connected. Cannot send poke.");
        }
    };




    return (



        <div className="min-h-screen bg-gray-100 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">

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
                                        {/* add a button to send poke */}
                                        <button
                                            onClick={() => sendPoke(user.socket_id)}
                                            className="ml-4 px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
                                        >
                                            Send Poke
                                        </button>

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