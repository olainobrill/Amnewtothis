import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function findFriendship(userId: string, otherId: string) {
  return prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: userId, addresseeId: otherId },
        { requesterId: otherId, addresseeId: userId },
      ],
    },
  });
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { userId: otherId } = await params;
  const userId = session.user.id;

  if (otherId === userId) {
    return NextResponse.json({ error: "Cannot friend yourself" }, { status: 400 });
  }

  const other = await prisma.user.findUnique({ where: { id: otherId } });
  if (!other) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await findFriendship(userId, otherId);
  if (existing) {
    return NextResponse.json(
      { error: "Friendship already exists", friendship: existing },
      { status: 409 }
    );
  }

  const friendship = await prisma.friendship.create({
    data: { requesterId: userId, addresseeId: otherId, status: "PENDING" },
  });

  await prisma.notification.create({
    data: { type: "FRIEND_REQUEST", recipientId: otherId, actorId: userId },
  });

  return NextResponse.json({ friendship });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { userId: otherId } = await params;
  const userId = session.user.id;

  const body = await req.json();
  const action = body.action as "accept" | "decline" | undefined;

  const friendship = await findFriendship(userId, otherId);
  if (!friendship || friendship.status !== "PENDING") {
    return NextResponse.json({ error: "No pending request" }, { status: 404 });
  }
  if (friendship.addresseeId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "accept") {
    const updated = await prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: "ACCEPTED" },
    });
    await prisma.notification.create({
      data: {
        type: "FRIEND_ACCEPT",
        recipientId: friendship.requesterId,
        actorId: userId,
      },
    });
    return NextResponse.json({ friendship: updated });
  }

  if (action === "decline") {
    await prisma.friendship.delete({ where: { id: friendship.id } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { userId: otherId } = await params;
  const userId = session.user.id;

  const friendship = await findFriendship(userId, otherId);
  if (!friendship) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.friendship.delete({ where: { id: friendship.id } });
  return NextResponse.json({ ok: true });
}
