"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "./Avatar";

type FriendState = "self" | "friends" | "incoming" | "outgoing" | "none";

export function ProfileHeader({
  profileUserId,
  name,
  username,
  bio,
  avatarUrl,
  coverUrl,
  friendCount,
  isOwnProfile,
  initialFriendState,
}: {
  profileUserId: string;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  friendCount: number;
  isOwnProfile: boolean;
  initialFriendState: FriendState;
}) {
  const router = useRouter();
  const [friendState, setFriendState] = useState<FriendState>(initialFriendState);
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState(bio ?? "");
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [busyPhoto, setBusyPhoto] = useState(false);

  const saveBio = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio: bioDraft }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  };

  const uploadPhoto = async (file: File, field: "avatar" | "cover") => {
    setBusyPhoto(true);
    const form = new FormData();
    form.set("field", field);
    form.set("image", file);
    await fetch("/api/profile/photo", { method: "POST", body: form });
    setBusyPhoto(false);
    router.refresh();
  };

  const sendRequest = async () => {
    setFriendState("outgoing");
    await fetch(`/api/friends/${profileUserId}`, { method: "POST" });
    router.refresh();
  };

  const acceptRequest = async () => {
    setFriendState("friends");
    await fetch(`/api/friends/${profileUserId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });
    router.refresh();
  };

  const cancelOrUnfriend = async () => {
    setFriendState("none");
    await fetch(`/api/friends/${profileUserId}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 border-t-0 mb-4">
      <div className="relative">
        <div className="h-56 sm:h-72 bg-gradient-to-br from-blue-200 to-blue-400 rounded-t-xl overflow-hidden">
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>
        {isOwnProfile && (
          <>
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={busyPhoto}
              className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-sm font-semibold rounded-lg px-3 py-1.5 shadow"
            >
              📷 Edit cover
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadPhoto(f, "cover");
              }}
            />
          </>
        )}

        <div className="absolute -bottom-12 left-6">
          <div className="relative">
            <div className="ring-4 ring-white rounded-full">
              <Avatar name={name} avatarUrl={avatarUrl} size={128} />
            </div>
            {isOwnProfile && (
              <>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={busyPhoto}
                  className="absolute bottom-1 right-1 bg-gray-200 hover:bg-gray-300 rounded-full w-9 h-9 flex items-center justify-center shadow"
                >
                  📷
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadPhoto(f, "avatar");
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="pt-16 pb-4 px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-gray-500 text-sm">@{username}</p>
            <p className="text-gray-500 text-sm mt-1">
              {friendCount} {friendCount === 1 ? "friend" : "friends"}
            </p>
          </div>

          {!isOwnProfile && (
            <div className="flex gap-2">
              {friendState === "none" && (
                <button
                  onClick={sendRequest}
                  className="bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold text-sm rounded-lg px-4 py-2"
                >
                  + Add Friend
                </button>
              )}
              {friendState === "outgoing" && (
                <button
                  onClick={cancelOrUnfriend}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-sm rounded-lg px-4 py-2"
                >
                  Cancel Request
                </button>
              )}
              {friendState === "incoming" && (
                <button
                  onClick={acceptRequest}
                  className="bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold text-sm rounded-lg px-4 py-2"
                >
                  Confirm Request
                </button>
              )}
              {friendState === "friends" && (
                <button
                  onClick={cancelOrUnfriend}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-sm rounded-lg px-4 py-2"
                >
                  ✓ Friends
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-4">
          {editing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                rows={3}
                maxLength={280}
                className="w-full bg-[#f0f2f5] rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Write something about yourself..."
              />
              <div className="flex gap-2">
                <button
                  onClick={saveBio}
                  disabled={saving}
                  className="bg-[#1877f2] text-white text-sm font-semibold rounded-lg px-4 py-1.5"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setBioDraft(bio ?? "");
                  }}
                  className="bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg px-4 py-1.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-700">
                {bio || (isOwnProfile ? "Add a bio to tell people about yourself." : "")}
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-[#1877f2] hover:underline shrink-0"
                >
                  Edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
