import { getSession } from "@/lib/jwt";
import { isSiteAuthorized } from "@/lib/sites";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { safePath } from "@/lib/safe-path";

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ site: string }> }
) => {
  const { site } = await params;
  const session = await getSession();
  if (!session || !isSiteAuthorized(site, session.username)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { newName, file } = await request.json();

    if (typeof file !== "string" || typeof newName !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const baseDir = `/var/www/${site}/public_html`;

    // Use the safe path template to construct paths
    const filePath = safePath`${baseDir}/${file}`;
    const newFilePath = safePath`${baseDir}/${newName}`;

    // rename the file
    try {
      await fs.rename(filePath.toString(), newFilePath.toString());
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error renaming file:", error);
      return NextResponse.json({ success: false }, { status: 500 });
    }
  } catch (error) {
    console.error("Error renaming file:", error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
};
