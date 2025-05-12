import { redirect } from "next/navigation";
import { getSession } from "@/lib/jwt";
import { listSites } from "@/lib/sites";
import { Button } from "@/components/ui/button";
import { OpenSiteButton } from "@/app/sites/open-site-button";
import { Archive } from "lucide-react";
import Link from "next/link";

export default async function SitesPage() {
  const session = await getSession();

  if (!session) {
    return redirect("/login");
  }

  const sites = await listSites(session.username);

  return (
    <div className="px-6 py-8 flex flex-col gap-6 flex-1">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-gray-900">Your Sites</h2>
        <p className="text-neutral-500">Your websites are shown here.</p>
      </div>
      {sites.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600">You don{"'"}t have any sites yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {sites.map((site) => (
            <div
              key={site.name}
              className="bg-white overflow-hidden border border-neutral-300/80 rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {site.name}.vercelle.com
                </h3>
                <div className="mt-3 flex items-center gap-3">
                  <OpenSiteButton siteName={site.name} />
                  <Button variant="outline" asChild>
                    <Link href={`/sites/${site.name}`}>
                      <Archive className="h-4 w-4 -nt-1 mr-0.5" />
                      Manage Files
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
