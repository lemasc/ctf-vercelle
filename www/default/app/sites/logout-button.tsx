"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      title="Logout"
      className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
    >
      Logout
    </Button>
  );
}
