import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/uploads";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const authorUsername = searchParams.get("username");

  const posts = await prisma.post.findMany({
    where: authorUsername
      ? { author: { username: authorUsername } }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: {
        select: { id: true, name: true, username: true, avatarUrl: true },
      },
      likes: { select: { userId: true } },
      _count: { select: { comments: true, likes: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        take: 2,
        include: {
          author: {
            select: { id: true, name: true, username: true, avatarUrl: true },
          },
        },
      },
    },
  });

  const result = posts.map((post) => ({
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt,
    author: post.author,
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    likedByMe: post.likes.some((l) => l.userId === session.user.id),
    previewComments: post.comments,
  }));

  return NextResponse.json({ posts: result });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const content = (formData.get("content") as string | null)?.trim() ?? "";
  const image = formData.get("image") as File | null;

  if (!content && (!image || image.size === 0)) {
    return NextResponse.json(
      { error: "Post must have text or an image" },
      { status: 400 }
    );
  }

  if (content.length > 5000) {
    return NextResponse.json({ error: "Post is too long" }, { status: 400 });
  }

  let imageUrl: string | undefined;
  if (image && image.size > 0) {
    try {
      imageUrl = await saveUploadedImage(image);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Upload failed" },
        { status: 400 }
      );
    }
  }

  const post = await prisma.post.create({
    data: {
      content,
      imageUrl,
      authorId: session.user.id,
    },
    include: {
      author: {
        select: { id: true, name: true, username: true, avatarUrl: true },
      },
    },
  });

  return NextResponse.json({
    post: {
      ...post,
      likeCount: 0,
      commentCount: 0,
      likedByMe: false,
      previewComments: [],
    },
  });
}
