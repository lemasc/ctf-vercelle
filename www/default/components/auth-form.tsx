"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      router.replace(`/sites`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-8 px-4">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          {mode === "login" ? "Sign in to your account" : "Create your account"}
        </h2>
      </div>
      <form className="space-y-6" method="POST" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="relative block w-full rounded-md border-0 py-2 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="relative block w-full rounded-md border-0 py-2 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 text-center font-medium">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : mode === "login" ? "Sign in" : "Sign up"}
          </button>
        </div>

        <hr className="border-t border-netural-300" />
        <div className="text-sm text-center text-neutral-500">
          {mode === "login" ? (
            <>
              Don{"'"}t have an account?{" "}
              <a
                href="/register"
                className="font-semibold text-black hover:text-gray-800 hover:underline"
              >
                Sign up
              </a>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <a
                href="/login"
                className="font-semibold text-black hover:text-gray-800 hover:underline"
              >
                Sign in
              </a>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
