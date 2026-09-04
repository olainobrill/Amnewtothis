import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ users: [] });
  }

  const candidates = await prisma.user.findMany({
    where: { id: { not: session.user.id } },
    select: { id: true, name: true, username: true, avatarUrl: true, bio: true },
    take: 500,
  });

  const needle = q.toLowerCase();
  const users = candidates
    .filter(
      (u) =>
        u.name.toLowerCase().includes(needle) ||
        u.username.toLowerCase().includes(needle)
    )
    .slice(0, 20);

  return NextResponse.json({ users });
}
