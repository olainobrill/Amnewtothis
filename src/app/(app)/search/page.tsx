import { FriendsPanel } from "@/components/FriendsPanel";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <FriendsPanel initialQuery={q ?? ""} />;
}
