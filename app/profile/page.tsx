"use client";
import { useSession } from "@/app/lib/auth-client"; // import the auth client
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "./loading";

function page() {
    const router = useRouter();

    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch, //refetch the session
    } = useSession();

    // Handle redirect after component has mounted
    useEffect(() => {
        if (!isPending && !error && !session) {
            router.replace("/login"); // Use replace instead of push
        }
    }, [session, isPending, error, router]);


    // Show loading while checking session
    if (isPending) {
        return <Loading />;
    }

    // If user is not logged in, redirect to login page
    if (!session) {
        return <Loading />;
    }

    return (

        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">Profile</h1>
                <div className="text-gray-600">
                    <p className="mb-4">
                        Welcome to your profile! This is a basic test page using
                        Tailwind CSS.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            Error: {error.message}
                        </div>
                    )}

                    {session && (
                        <div className="mt-4">
                            <h2 className="text-lg font-semibold mb-2 text-gray-800">
                                User Information
                            </h2>
                            <div className="space-y-2">
                                <p className="text-gray-800">
                                    <strong>User ID:</strong> {session.user.id}
                                </p>
                                <p className="text-gray-800">
                                    <strong>Email:</strong> {session.user.email}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
}

export default page;
