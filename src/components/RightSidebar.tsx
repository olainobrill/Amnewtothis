import Link from "next/link";
import { prisma } from "@/lib/prisma";

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export async function RightSidebar({ userId }: { userId: string }) {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    include: { requester: true, addressee: true },
    take: 9,
    orderBy: { createdAt: "desc" },
  });

  const friends = friendships.map((f) =>
    f.requesterId === userId ? f.addressee : f.requester
  );

  return (
    <aside className="hidden xl:flex flex-col gap-1 w-72 shrink-0 py-4 pl-2">
      <h2 className="text-gray-500 font-semibold px-2 mb-1">Contacts</h2>
      {friends.length === 0 && (
        <p className="text-sm text-gray-400 px-2">
          No friends yet — find people to connect with.
        </p>
      )}
      {friends.map((f) => (
        <Link
          key={f.id}
          href={`/profile/${f.username}`}
          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-200/70"
        >
          {f.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={f.avatarUrl}
              alt={f.name}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <span className="w-9 h-9 rounded-full bg-[#1877f2] text-white flex items-center justify-center text-xs font-bold">
              {initialsOf(f.name)}
            </span>
          )}
          <span className="text-sm font-medium">{f.name}</span>
        </Link>
      ))}
    </aside>
  );
}
