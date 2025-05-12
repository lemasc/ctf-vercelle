import { getSession } from "@/lib/jwt";
import { isSiteAuthorized, renameSite } from "@/lib/sites";
import { NextResponse } from "next/server";

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
    const { newName } = await request.json();
    if (!newName) {
      return new Response("New name is required", { status: 400 });
    }

    try {
      await renameSite(site, newName);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error renaming site:", error);
      return NextResponse.json({ success: false });
    }
  } catch (error) {
    console.error("Error renaming site:", error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
};
