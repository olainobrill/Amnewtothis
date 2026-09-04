import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/uploads";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const field = formData.get("field");
  const image = formData.get("image") as File | null;

  if (field !== "avatar" && field !== "cover") {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }
  if (!image || image.size === 0) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  let url: string;
  try {
    url = await saveUploadedImage(image);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: field === "avatar" ? { avatarUrl: url } : { coverUrl: url },
  });

  return NextResponse.json({ user });
}
