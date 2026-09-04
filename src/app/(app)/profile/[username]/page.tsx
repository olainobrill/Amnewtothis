import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Feed } from "@/components/Feed";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { username } = await params;
  const profileUser = await prisma.user.findUnique({ where: { username } });
  if (!profileUser) notFound();

  const isOwnProfile = profileUser.id === session.user.id;

  const friendCount = await prisma.friendship.count({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: profileUser.id }, { addresseeId: profileUser.id }],
    },
  });

  let friendState: "self" | "friends" | "incoming" | "outgoing" | "none" = "none";
  if (isOwnProfile) {
    friendState = "self";
  } else {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: session.user.id, addresseeId: profileUser.id },
          { requesterId: profileUser.id, addresseeId: session.user.id },
        ],
      },
    });
    if (friendship) {
      if (friendship.status === "ACCEPTED") friendState = "friends";
      else if (friendship.requesterId === session.user.id) friendState = "outgoing";
      else friendState = "incoming";
    }
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <ProfileHeader
        profileUserId={profileUser.id}
        name={profileUser.name}
        username={profileUser.username}
        bio={profileUser.bio}
        avatarUrl={profileUser.avatarUrl}
        coverUrl={profileUser.coverUrl}
        friendCount={friendCount}
        isOwnProfile={isOwnProfile}
        initialFriendState={friendState}
      />
      <Feed
        currentUserId={session.user.id}
        currentUserName={profileUser.name}
        currentUserAvatar={profileUser.avatarUrl}
        usernameFilter={username}
        showComposer={isOwnProfile}
      />
    </div>
  );
}
