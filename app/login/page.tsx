"use client";
import { signIn, useSession } from "@/app/lib/auth-client"; // import the auth client
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

    // Handle redirect after component has mounted - only redirect if user is already logged in
    useEffect(() => {
        if (session) {
            router.replace("/dashboard"); // Use replace instead of push
        }
    }, [session, router]);  

    // Show loading while checking session
    if (isPending) {
        return <Loading />;
    }

    // If user is already logged in, show loading while redirecting
    if (session) {
        return <Loading />;
    }




    async function handleSignIn() {
        await signIn.social({
            provider: "google",

            callbackURL: "/dashboard",

            errorCallbackURL: "/error",

            newUserCallbackURL: "/profile",
            
        });
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">Login</h1>
                <p className="text-gray-600 mb-4">
                    Please sign in to access your account.
                </p>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        Error: {error.message}
                    </div>
                )}

                <button
                    onClick={handleSignIn}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 1c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}


export default page;
