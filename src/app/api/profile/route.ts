import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const bio = typeof body.bio === "string" ? body.bio.slice(0, 280) : undefined;
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : undefined;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(bio !== undefined ? { bio } : {}),
      ...(name ? { name } : {}),
    },
  });

  return NextResponse.json({ user });
}
