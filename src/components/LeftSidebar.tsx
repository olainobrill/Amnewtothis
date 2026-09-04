import Link from "next/link";

type LeftSidebarProps = {
  username: string;
  name: string;
  avatarUrl: string | null;
  friendCount: number;
};

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function LeftSidebar({
  username,
  name,
  avatarUrl,
  friendCount,
}: LeftSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col gap-1 w-64 shrink-0 py-4 pr-2">
      <Link
        href={`/profile/${username}`}
        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-200/70"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <span className="w-9 h-9 rounded-full bg-[#1877f2] text-white flex items-center justify-center text-sm font-bold">
            {initialsOf(name)}
          </span>
        )}
        <span className="font-semibold text-sm">{name}</span>
      </Link>

      <Link
        href="/friends"
        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-200/70"
      >
        <span className="w-9 h-9 rounded-full bg-blue-100 text-[#1877f2] flex items-center justify-center text-lg">
          👥
        </span>
        <span className="text-sm font-medium">
          Friends
          {friendCount > 0 && (
            <span className="ml-1 text-gray-500">({friendCount})</span>
          )}
        </span>
      </Link>

      <Link
        href="/"
        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-200/70"
      >
        <span className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-lg">
          🏠
        </span>
        <span className="text-sm font-medium">News Feed</span>
      </Link>

      <Link
        href="/search"
        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-200/70"
      >
        <span className="w-9 h-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-lg">
          🔍
        </span>
        <span className="text-sm font-medium">Find people</span>
      </Link>
    </aside>
  );
}
