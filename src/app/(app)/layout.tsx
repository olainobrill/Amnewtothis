import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { LeftSidebar } from "@/components/LeftSidebar";
import type { ReactNode } from "react";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  const friendCount = await prisma.friendship.count({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: user.id }, { addresseeId: user.id }],
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        username={user.username}
        name={user.name}
        avatarUrl={user.avatarUrl}
      />
      <div className="flex flex-1 w-full max-w-[1400px] mx-auto px-4">
        <LeftSidebar
          username={user.username}
          name={user.name}
          avatarUrl={user.avatarUrl}
          friendCount={friendCount}
        />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
