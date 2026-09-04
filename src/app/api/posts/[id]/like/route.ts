import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId } = await params;
  const userId = session.user.id;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    const likeCount = await prisma.like.count({ where: { postId } });
    return NextResponse.json({ liked: false, likeCount });
  }

  await prisma.like.create({ data: { postId, userId } });

  if (post.authorId !== userId) {
    await prisma.notification.create({
      data: {
        type: "LIKE",
        recipientId: post.authorId,
        actorId: userId,
        postId,
      },
    });
  }

  const likeCount = await prisma.like.count({ where: { postId } });
  return NextResponse.json({ liked: true, likeCount });
}
