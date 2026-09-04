import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: {
      author: {
        select: { id: true, name: true, username: true, avatarUrl: true },
      },
    },
  });

  return NextResponse.json({ comments });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId } = await params;
  const body = await req.json();
  const content = (body.content as string | undefined)?.trim();

  if (!content || content.length === 0) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: "Comment is too long" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: { content, postId, authorId: session.user.id },
    include: {
      author: {
        select: { id: true, name: true, username: true, avatarUrl: true },
      },
    },
  });

  if (post.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        type: "COMMENT",
        recipientId: post.authorId,
        actorId: session.user.id,
        postId,
      },
    });
  }

  return NextResponse.json({ comment });
}
