import { getSession } from "@/lib/jwt";
import { redirect } from "next/navigation";

export default async function GET() {
  const session = await getSession();
  if (!session) {
    return redirect("/login");
  }
  return redirect(`/sites`);
}
