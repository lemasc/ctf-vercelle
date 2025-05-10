import { FileManager, FileItem } from "@/components/FileManager";
import { getSession } from "@/lib/jwt";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";

const mockFiles: FileItem[] = [
  {
    id: "1",
    name: "Documents",
    type: "folder",
    lastModified: new Date("2024-03-15"),
  },
  {
    id: "2",
    name: "Project Proposal.docx",
    type: "file",
    lastModified: new Date("2024-03-14"),
    size: 2.5 * 1024 * 1024, // 2.5 MB
  },
  {
    id: "3",
    name: "Images",
    type: "folder",
    lastModified: new Date("2024-03-13"),
  },
  {
    id: "4",
    name: "Presentation.pptx",
    type: "file",
    lastModified: new Date("2024-03-12"),
    size: 15.8 * 1024 * 1024, // 15.8 MB
  },
  {
    id: "5",
    name: "Budget.xlsx",
    type: "file",
    lastModified: new Date("2024-03-11"),
    size: 1.2 * 1024 * 1024, // 1.2 MB
  },
];

export default async function Page({ params: _params }: { params: Promise<{ site: string }> }) {
  const params = await _params;
  const session = await getSession();

  if (!session) {
    redirect("/login");
  } else if (session.username !== params.site) {
    redirect(`/sites/${session.username}`);
  }
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {session.username}!
          </h1>
          <LogoutButton />
        </div>
        <p className="text-gray-600">
          This is your personal dashboard. You{"'"}ve successfully logged in.
        </p>
        <main>
          <h1 className="text-2xl font-bold mb-6">File Manager</h1>
          <FileManager items={mockFiles} />
        </main>
      </div>
    </div>
  );
}
