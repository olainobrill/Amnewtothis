import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Feed } from "@/components/Feed";
import { RightSidebar } from "@/components/RightSidebar";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) redirect("/login");

  return (
    <div className="flex">
      <div className="flex-1 min-w-0">
        <Feed
          currentUserId={user.id}
          currentUserName={user.name}
          currentUserAvatar={user.avatarUrl}
        />
      </div>
      <RightSidebar userId={user.id} />
    </div>
  );
}
