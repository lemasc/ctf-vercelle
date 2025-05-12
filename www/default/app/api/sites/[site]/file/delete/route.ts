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
    const { fileNames } = await request.json();

    if (
      !Array.isArray(fileNames) ||
      fileNames.length === 0 ||
      !fileNames.every((name) => typeof name === "string")
    ) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const baseDir = safePath`/var/www/${site}/public_html`;

    const deletePromises = fileNames.map(async (name) => {
      const filePath = safePath`${baseDir}/${name}`;
      try {
        await fs.unlink(filePath.toString());
        return { success: true, name };
      } catch (error) {
        return {
          success: false,
          name,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    const results = await Promise.all(deletePromises);

    const failure = results.filter((result) => !result.success);

    const success = failure.length === 0;
    return NextResponse.json({
      success,
      message: success
        ? "Files deleted successfully"
        : `Failed to delete ${failure.length} files.`,
      ...(success ? {} : { failures: failure }),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Bad request", failures: [] },
      { status: 400 }
    );
  }
};
