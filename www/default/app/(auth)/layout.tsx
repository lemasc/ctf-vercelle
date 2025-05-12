import Image from "next/image";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="p-6 border-b border-zinc-200 flex">
        <div className="mx-auto max-w-7xl w-full flex justify-between items-center">
          <Link href="/" className="flex gap-4">
            <Image src="/vercel.svg" alt="Vercel Logo" width={24} height={24} />
            <b className="text-xl">Vercelle</b>
          </Link>
        </div>
      </nav>
      <main className="flex-1 flex flex-col items-center px-6 py-8">
        {children}
      </main>
    </div>
  );
}
