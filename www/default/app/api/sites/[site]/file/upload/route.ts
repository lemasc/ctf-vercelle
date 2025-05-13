import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { promises as fs } from "fs";
import { isSiteAuthorized } from "@/lib/sites";
import { safePath } from "@/lib/safe-path";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ site: string }> }
) {
  const { site } = await params;
  const session = await getSession();
  if (!session || !isSiteAuthorized(site, session.username)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    const root = formData.get("root");

    if (root && typeof root !== "string") {
      return NextResponse.json({ error: "Invalid root" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadPath = safePath`/var/www/${site}/public_html${(
      root ?? "/"
    ).split("/")}${file.name}`;

    try {
      await fs.writeFile(uploadPath.toString(), buffer);
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json(
        { error: "Failed to save file" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
