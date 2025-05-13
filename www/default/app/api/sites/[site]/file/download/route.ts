import { getSession } from "@/lib/jwt";
import { isSiteAuthorized } from "@/lib/sites";
import { NextRequest, NextResponse } from "next/server";
import { safePath, SanitizedPath } from "@/lib/safe-path";
import { promises as fs } from "fs";
import { basename } from "path";
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

  const query = request.nextUrl.searchParams;

  const fileNames = query.getAll("fileName");

  if (!Array.isArray(fileNames) || fileNames.length === 0) {
    return NextResponse.json({ error: "Invalid file names" }, { status: 400 });
  }

  try {
    const requestedRoot = query.get("root");
    if (requestedRoot && typeof requestedRoot !== "string") {
      return NextResponse.json({ error: "Invalid root" }, { status: 400 });
    }
    const root = safePath`/var/www/${site}/public_html${(
      requestedRoot || "/"
    ).split("/")}`;

    if (fileNames.length === 1) {
      const filePath = safePath`${root}/${fileNames[0]}`;
      try {
        const stat = await fs.stat(filePath.toString());
        if (stat.isFile()) {
          // target is a single file
          const file = await fs.readFile(filePath.toString());
          return new Response(file, {
            headers: {
              "Content-Type": "application/octet-stream",
              "Content-Disposition": `attachment; filename="${fileNames[0]}"`,
            },
          });
        }
      } catch (error) {
        console.error("Error reading file:", error);
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
    }

    const zip = new JSZip();

    const addToZip = async (files: string[], folder: SanitizedPath) => {
      for (const fileName of files) {
        const filePath = safePath`${root}/${folder}/${fileName}`;
        try {
          // check if the path given is a directory
          const path = filePath.toString();
          const stat = await fs.stat(path);
          if (stat.isDirectory()) {
            // add the directory to the zip
            const filesInside = await fs.readdir(path);
            await addToZip(filesInside, safePath`${folder}${basename(path)}`);
          } else {
            // add the file to the zip
            const file = await fs.readFile(filePath.toString());
            zip.file(folder + "/" + fileName, file);
          }
        } catch (error) {
          console.error("Error reading file:", error);
          return NextResponse.json(
            { error: "File not found" },
            { status: 404 }
          );
        }
      }
    };

    await addToZip(fileNames, safePath`/`);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    return new Response(zipBlob, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${site}-${new Date().toISOString()}.zip"`,
      },
    });
  } catch (error) {
    console.error("Error downloading file", error);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
};
