import { FileManager } from "@/components/FileManager";
import { getSession } from "@/lib/jwt";
import { redirect } from "next/navigation";
import { getSiteFiles, isSiteAuthorized } from "@/lib/sites";
import { OpenSiteButton } from "../open-site-button";

export default async function Page({
  params: _params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site } = await _params;
  const session = await getSession();

  if (!session || !isSiteAuthorized(site, session.username)) {
    redirect("/login");
  }

  const files = await getSiteFiles(site);

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
        <h2 className="text-2xl font-bold">File Manager</h2>
        <FileManager items={files} site={site} />
      </div>
    </div>
  );
}
