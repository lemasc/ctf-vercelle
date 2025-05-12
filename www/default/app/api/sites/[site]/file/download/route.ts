import { getSession } from "@/lib/jwt";
import { isSiteAuthorized } from "@/lib/sites";
import { NextRequest, NextResponse } from "next/server";
import { safePath } from "@/lib/safe-path";
import { promises as fs } from "fs";
import JSZip from "jszip";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ site: string }> }
) => {
  const { site } = await params;
  const session = await getSession();
  if (!session || !isSiteAuthorized(site, session.username)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fileNames = request.nextUrl.searchParams.getAll("fileName");

  if (!Array.isArray(fileNames) || fileNames.length === 0) {
    return NextResponse.json({ error: "Invalid file names" }, { status: 400 });
  }

  try {
    if (fileNames.length === 1) {
      const filePath = safePath`/var/www/${site}/public_html/${fileNames[0]}`;

      try {
        const file = await fs.readFile(filePath.toString());
        return new Response(file, {
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${fileNames[0]}"`,
          },
        });
      } catch (error) {
        console.error("Error reading file:", error);
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
    } else {
      const zip = new JSZip();
      for (const fileName of fileNames) {
        const filePath = safePath`/var/www/${site}/public_html/${fileName}`;
        try {
          const file = await fs.readFile(filePath.toString());
          zip.file(fileName, file);
        } catch (error) {
          console.error("Error reading file:", error);
          return NextResponse.json(
            { error: "File not found" },
            { status: 404 }
          );
        }
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      return new Response(zipBlob, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${site}-${
            new Date().toISOString().split("T")[0]
          }.zip"`,
        },
      });
    }
  } catch (error) {
    console.error("Error downloading file", error);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
};
