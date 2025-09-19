"use client";
import Link from "next/link";
import { signOut } from "@/app/lib/auth-client";
import { useRouter } from "next/navigation";
import { useSession } from "@/app/lib/auth-client"; // import the auth client
import { usePresence } from "@/app/lib/presence-context";

function Navbar() {
  const router = useRouter();
  const { isOnline, userCount, isLoading, error: presenceError } = usePresence();

  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  } = useSession();

  const handleSignOut: () => Promise<void> = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login"); // Use replace instead of push
        },
      },
    });
  };

  if (error) {
    return (
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-white font-bold text-xl">
            <Link href="/">Logo</Link>
          </div>
          <div className="text-red-300">Error: {error.message}</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-white font-bold text-xl">
            <Link href="/">Logo</Link>
          </div>
          {session && !isPending && (
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isLoading ? "bg-yellow-400" : isOnline ? "bg-green-400" : "bg-red-400"
                }`}
              />
              <span className={`text-sm ${
                isLoading ? "text-yellow-400" : isOnline ? "text-green-400" : "text-red-400"
              }`}>
                {isLoading ? "Connecting..." : isOnline ? "Online" : "Offline"}
              </span>
              <span className="text-gray-300 text-sm">
                ({userCount} user{userCount !== 1 ? 's' : ''} online)
              </span>
            </div>
          )}
        </div>
        <ul className="flex space-x-6">
          {session && !isPending ? (
            <>
              <li>
                <span className="text-gray-300">
                  {session.user?.email || "No Email"}
                </span>
              </li>

              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-white"
                >
                  dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-gray-300 hover:text-white"
                >
                  profile
                </Link>
              </li>
              <li>
                <button
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-white bg-transparent border-none cursor-pointer font-inherit text-base"
                >
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-300 hover:text-white">
                  login
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
