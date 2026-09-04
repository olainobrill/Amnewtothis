"use client";

import { useRef, useState } from "react";
import { Avatar } from "./Avatar";
import type { PostModel } from "@/types/models";

type PostComposerProps = {
  name: string;
  avatarUrl: string | null;
  onPosted: (post: PostModel) => void;
};

export function PostComposer({ name, avatarUrl, onPosted }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async () => {
    if (!content.trim() && !imageFile) return;
    setSubmitting(true);
    setError(null);

    const form = new FormData();
    form.set("content", content.trim());
    if (imageFile) form.set("image", imageFile);

    const res = await fetch("/api/posts", { method: "POST", body: form });
    const data = await res.json();

    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to post");
      return;
    }

    onPosted(data.post);
    setContent("");
    clearImage();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex gap-3">
        <Avatar name={name} avatarUrl={avatarUrl} size={40} />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${name.split(" ")[0]}?`}
          rows={2}
          className="flex-1 bg-[#f0f2f5] rounded-2xl px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {imagePreview && (
        <div className="relative mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full max-h-96 object-cover rounded-lg"
          />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80"
          >
            ✕
          </button>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      <hr className="my-3" />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 rounded-lg px-3 py-2 cursor-pointer font-medium text-sm">
          🖼️ Photo
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
        </label>
        <button
          onClick={submit}
          disabled={submitting || (!content.trim() && !imageFile)}
          className="bg-[#1877f2] hover:bg-[#166fe5] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg px-5 py-2"
        >
          {submitting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
