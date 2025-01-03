"use client";
import {
  ClerkLoaded,
  SignedIn,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import Form from "next/form";
import { PackageIcon, TrolleyIcon } from "@sanity/icons";
import useBasketStore from "@/store/store";

const Header = () => {
  const { user } = useUser();

  // Move the hook call directly to the top level of the component
  const itemCount = useBasketStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

  const createClerkPasskey = async () => {
    if (!user) return;

    try {
      const passkeyResponse = await user.createPasskey();
      console.log("Passkey created successfully:", passkeyResponse);
    } catch (err: any) {
      if (err.code === "passkey_registration_cancelled") {
        console.warn("User canceled passkey registration.");
      } else {
        console.error("Unexpected error:", err);
      }
    }
  };

  return (
    <header className="flex flex-wrap justify-between items-center px-4 py-2">
      <div className="flex w-full flex-wrap justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Home"
          className="text-2xl font-bold text-blue-500 hover:opacity-50 cursor-pointer"
        >
          Shope
        </Link>

        {/* Search Bar */}
        <Form
          action="/search"
          className="w-full sm:w-auto sm:flex-1 sm:mx-4 mt-2 sm:mt-0"
        >
          <input
            type="text"
            name="query"
            aria-label="Search products"
            placeholder="Search for products"
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded focus:outline-none focus:ring-blue-500/50 border w-full max-w-4xl"
          />
        </Form>

        {/* User Actions */}
        <div className="flex items-center gap-x-4">
          <Link
            href="/basket"
            aria-label={`View basket with ${itemCount} items`}
            className="relative flex items-center space-x-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            <TrolleyIcon className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {itemCount}
            </span>
            <span>My Basket</span>
          </Link>

          <ClerkLoaded>
            <SignedIn>
              <Link
                href="/orders"
                aria-label="View my orders"
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                <PackageIcon className="w-6 h-6" />
                <span>My Orders</span>
              </Link>
            </SignedIn>
            {user ? (
              <div className="flex items-center gap-x-2">
                <UserButton />
                <div className="hidden sm:block text-xs">
                  <p className="text-gray-400">Welcome Back</p>
                  <p>{user.fullName}</p>
                </div>
              </div>
            ) : (
              <SignInButton mode="modal" />
            )}
            {user?.passkeys.length === 0 && (
              <button
                onClick={createClerkPasskey}
                aria-label="Create a passkey"
                className="bg-white hover:bg-blue-500 hover:text-white text-blue-500 font-bold py-2 px-4 rounded border"
              >
                Create Passkey
              </button>
            )}
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
};

export default Header;
