import { FileManager } from "@/components/FileManager";
import { getSession } from "@/lib/jwt";
import { redirect } from "next/navigation";
import { getSiteFiles, isSiteAuthorized } from "@/lib/sites";
import { OpenSiteButton } from "../open-site-button";

export default async function Page({
  params,
}: {
  params: Promise<{ site: string; path?: string[] }>;
}) {
  const { site, path: _path } = await params;
  const path = "/" + (_path?.join("/") ?? "");

  const session = await getSession();

  if (!session || !isSiteAuthorized(site, session.username)) {
    redirect("/login");
  }

  const files = await getSiteFiles(site, path);

  return (
    <div className="px-6 py-8 flex flex-col gap-8 flex-1">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {site}.vercelle.com
          </h1>
          <p className="text-neutral-500">Manage your website files here.</p>
        </div>
        <OpenSiteButton size="lg" siteName={site} />
      </div>
      <hr className="border-neutral-200 border-b" />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">File Manager</h2>
          <div className="text-sm text-neutral-800">Path: {path}</div>
        </div>
        <FileManager items={files} site={site} root={path} />
      </div>
    </div>
  );
}
