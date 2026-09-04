"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "./Avatar";
import { timeAgo } from "@/lib/time";
import type { CommentModel, PostModel } from "@/types/models";

export function PostCard({
  post,
  currentUserId,
  onDeleted,
}: {
  post: PostModel;
  currentUserId: string;
  onDeleted?: (id: string) => void;
}) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [comments, setComments] = useState<CommentModel[]>(post.previewComments);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const toggleLike = async () => {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    }
  };

  const loadAllComments = async () => {
    setShowAllComments(true);
    const res = await fetch(`/api/posts/${post.id}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data.comments);
    }
  };

  const submitComment = async () => {
    const text = commentDraft.trim();
    if (!text) return;
    setPosting(true);
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    setPosting(false);
    if (res.ok) {
      const data = await res.json();
      setComments((c) => [...c, data.comment]);
      setCommentCount((c) => c + 1);
      setCommentDraft("");
      setShowAllComments(true);
    }
  };

  const deletePost = async () => {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) onDeleted?.(post.id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between">
        <Link
          href={`/profile/${post.author.username}`}
          className="flex items-center gap-3"
        >
          <Avatar name={post.author.name} avatarUrl={post.author.avatarUrl} size={40} />
          <div>
            <p className="font-semibold text-sm hover:underline">
              {post.author.name}
            </p>
            <p className="text-xs text-gray-500">{timeAgo(post.createdAt)} ago</p>
          </div>
        </Link>
        {post.author.id === currentUserId && (
          <button
            onClick={deletePost}
            className="text-gray-400 hover:text-red-600 text-sm px-2"
            title="Delete post"
          >
            ✕
          </button>
        )}
      </div>

      {post.content && (
        <p className="mt-3 text-[15px] whitespace-pre-wrap break-words">
          {post.content}
        </p>
      )}

      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt="Post attachment"
          className="mt-3 w-full max-h-[520px] object-cover rounded-lg"
        />
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 mt-3 px-1">
        <span>{likeCount > 0 ? `👍 ${likeCount}` : ""}</span>
        <span>{commentCount > 0 ? `${commentCount} comments` : ""}</span>
      </div>

      <hr className="my-2" />

      <div className="flex items-center gap-1">
        <button
          onClick={toggleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 ${
            liked ? "text-[#1877f2]" : "text-gray-600"
          }`}
        >
          👍 Like
        </button>
        <button
          onClick={loadAllComments}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-sm text-gray-600 hover:bg-gray-100"
        >
          💬 Comment
        </button>
      </div>

      {(comments.length > 0 || showAllComments) && (
        <div className="mt-2 flex flex-col gap-2">
          {!showAllComments && commentCount > comments.length && (
            <button
              onClick={loadAllComments}
              className="text-sm text-gray-500 hover:underline self-start"
            >
              View all {commentCount} comments
            </button>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <Avatar name={c.author.name} avatarUrl={c.author.avatarUrl} size={28} />
              <div className="bg-[#f0f2f5] rounded-2xl px-3 py-2">
                <p className="text-xs font-semibold">{c.author.name}</p>
                <p className="text-sm break-words whitespace-pre-wrap">
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        <input
          value={commentDraft}
          onChange={(e) => setCommentDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitComment();
          }}
          placeholder="Write a comment..."
          className="flex-1 bg-[#f0f2f5] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          onClick={submitComment}
          disabled={posting || !commentDraft.trim()}
          className="text-[#1877f2] font-semibold text-sm disabled:opacity-40"
        >
          Post
        </button>
      </div>
    </div>
  );
}
