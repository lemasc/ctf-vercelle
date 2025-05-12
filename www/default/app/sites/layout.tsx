import { getSession } from "@/lib/jwt";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    return redirect("/login");
  }
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="p-6 border-b border-zinc-200 flex">
        <div className="mx-auto max-w-7xl w-full flex justify-between items-center">
          <Link href="/sites" className="flex gap-4">
            <Image src="/vercel.svg" alt="Vercel Logo" width={24} height={24} />
            <b className="text-xl">Vercelle</b>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex gap-4 text-sm">
              <div className="text-neutral-800">
                <p>
                  Logged in as: <b>{session.username}</b>
                </p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <div className="bg-neutral-50 flex-1">
        <main className="mx-auto max-w-7xl flex-1">{children}</main>
      </div>
    </div>
  );
}
