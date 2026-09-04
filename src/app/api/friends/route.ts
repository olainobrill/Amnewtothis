import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const [accepted, incoming, outgoing] = await Promise.all([
    prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: { requester: true, addressee: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { status: "PENDING", addresseeId: userId },
      include: { requester: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { status: "PENDING", requesterId: userId },
      include: { addressee: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const friends = accepted.map((f) => {
    const other = f.requesterId === userId ? f.addressee : f.requester;
    return {
      id: other.id,
      name: other.name,
      username: other.username,
      avatarUrl: other.avatarUrl,
    };
  });

  const publicUser = (u: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  }) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    avatarUrl: u.avatarUrl,
  });

  return NextResponse.json({
    friends,
    incomingRequests: incoming.map((f) => publicUser(f.requester)),
    outgoingRequests: outgoing.map((f) => publicUser(f.addressee)),
  });
}
