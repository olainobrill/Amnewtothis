"use client";

import { useEffect, useState } from "react";
import { PostComposer } from "./PostComposer";
import { PostCard } from "./PostCard";
import type { PostModel } from "@/types/models";

export function Feed({
  currentUserId,
  currentUserName,
  currentUserAvatar,
  usernameFilter,
  showComposer = true,
}: {
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string | null;
  usernameFilter?: string;
  showComposer?: boolean;
}) {
  const [posts, setPosts] = useState<PostModel[] | null>(null);

  useEffect(() => {
    const url = usernameFilter
      ? `/api/posts?username=${encodeURIComponent(usernameFilter)}`
      : "/api/posts";
    fetch(url)
      .then((res) => res.json())
      .then((data) => setPosts(data.posts));
  }, [usernameFilter]);

  return (
    <div className="max-w-xl mx-auto py-4">
      {showComposer && (
        <PostComposer
          name={currentUserName}
          avatarUrl={currentUserAvatar}
          onPosted={(post) => setPosts((prev) => [post, ...(prev ?? [])])}
        />
      )}

      {posts === null && (
        <p className="text-center text-gray-400 text-sm py-8">Loading feed...</p>
      )}

      {posts?.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">
          {usernameFilter
            ? "No posts yet."
            : "No posts yet. Be the first to share something!"}
        </p>
      )}

      {posts?.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onDeleted={(id) =>
            setPosts((prev) => prev?.filter((p) => p.id !== id) ?? null)
          }
        />
      ))}
    </div>
  );
}
