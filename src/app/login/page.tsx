"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] px-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-[#1877f2] text-5xl font-bold tracking-tight">
            connectly
          </h1>
          <p className="mt-4 text-xl text-gray-700 max-w-md mx-auto md:mx-0">
            Connectly helps you connect and share with the people in your
            life.
          </p>
        </div>

        <div className="flex-1 w-full max-w-sm">
          <form
            onSubmit={onSubmit}
            className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-3"
          >
            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-lg rounded-md py-3 mt-1 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
            <hr className="my-2" />
            <Link
              href="/register"
              className="bg-[#42b72a] hover:bg-[#36a420] text-white font-bold text-base rounded-md py-3 text-center"
            >
              Create new account
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
