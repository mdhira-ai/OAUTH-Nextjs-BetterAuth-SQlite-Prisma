'use client'
import { useSession } from "@/app/lib/auth-client";
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



        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">


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
                    <pre className="bg-gray-100 p-4 rounded overflow-scroll  break-words">{JSON.stringify(session, null, 2)}</pre>
                </div>
            </div>
        </div>

    );
}

export default page;