import { FileItem } from "@/components/FileManager";
import { ls } from "./commands";
import { promises as fs } from "fs";

export const listSites = async (username: string) => {
  return (await ls("/var/www")).filter(
    (site) =>
      // Filter sites that belong to the current user's group
      site.type === "dir" &&
      (process.env.NODE_ENV === "development" ? true : site.group === username) &&
      // Exclude special directories
      ![".force-redirect", "default"].includes(site.name)
  );
};

export const isSiteAuthorized = async (siteName: string, username: string) => {
  const sites = await ls("/var/www");
  return sites.some(
    (site) => site.name === siteName && (process.env.NODE_ENV === "development" ? true : site.group === username)
  );
};

export const renameSite = async (oldName: string, newName: string) => {
  const sites = await ls("/var/www");
  const destExists = sites.find((site) => site.name === newName);
  if (destExists) {
    throw new Error("Destination site already exists");
  }
  await fs.rename(`/var/www/${oldName}`, `/var/www/${newName}`);
};

export async function getSiteFiles(siteName: string, path = "/"): Promise<FileItem[]> {
  try {
    const files = await ls(`/var/www/${siteName}/public_html${path}`);
    return files.map((file) => ({
      name: file.name,
      type: file.type,
      lastModified: file.dateModified,
      size: file.size,
    }));
  } catch (error) {
    console.error("Error listing site files:", error);
    throw new Error("Error listing site files");
  }
}
