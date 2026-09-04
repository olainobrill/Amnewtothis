"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "./Avatar";
import type { PublicUser } from "@/types/models";

export function FriendsPanel({ initialQuery = "" }: { initialQuery?: string }) {
  const [friends, setFriends] = useState<PublicUser[]>([]);
  const [incoming, setIncoming] = useState<PublicUser[]>([]);
  const [outgoing, setOutgoing] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<PublicUser[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const load = async () => {
    const res = await fetch("/api/friends");
    const data = await res.json();
    setFriends(data.friends);
    setIncoming(data.incomingRequests);
    setOutgoing(data.outgoingRequests);
    setLoading(false);
  };

  const performSearch = async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setSearching(true);
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data.users);
    setSearching(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    if (initialQuery.trim()) {
      performSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSearch = (q: string) => {
    setQuery(q);
    performSearch(q);
  };

  const sendRequest = async (userId: string) => {
    setPendingIds((s) => new Set(s).add(userId));
    await fetch(`/api/friends/${userId}`, { method: "POST" });
    await load();
  };

  const respond = async (userId: string, action: "accept" | "decline") => {
    await fetch(`/api/friends/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    await load();
  };

  const removeFriendOrCancel = async (userId: string) => {
    await fetch(`/api/friends/${userId}`, { method: "DELETE" });
    await load();
  };

  const friendIds = new Set(friends.map((f) => f.id));
  const outgoingIds = new Set(outgoing.map((f) => f.id));
  const incomingIds = new Set(incoming.map((f) => f.id));

  return (
    <div className="max-w-3xl mx-auto py-4 flex flex-col gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="font-semibold text-lg mb-3">Find people</h2>
        <input
          value={query}
          onChange={(e) => runSearch(e.target.value)}
          placeholder="Search by name or username"
          className="w-full bg-[#f0f2f5] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        {searching && <p className="text-sm text-gray-400 mt-2">Searching...</p>}
        {results && results.length === 0 && !searching && (
          <p className="text-sm text-gray-400 mt-2">No users found.</p>
        )}
        <div className="mt-3 grid sm:grid-cols-2 gap-2">
          {results?.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between gap-2 border border-gray-100 rounded-lg p-2"
            >
              <Link
                href={`/profile/${u.username}`}
                className="flex items-center gap-2 min-w-0"
              >
                <Avatar name={u.name} avatarUrl={u.avatarUrl} size={36} />
                <span className="text-sm font-medium truncate">{u.name}</span>
              </Link>
              {friendIds.has(u.id) ? (
                <span className="text-xs text-gray-400 shrink-0">Friends</span>
              ) : outgoingIds.has(u.id) ? (
                <span className="text-xs text-gray-400 shrink-0">Requested</span>
              ) : incomingIds.has(u.id) ? (
                <button
                  onClick={() => respond(u.id, "accept")}
                  className="text-xs bg-[#1877f2] text-white rounded px-2 py-1 shrink-0"
                >
                  Accept
                </button>
              ) : (
                <button
                  onClick={() => sendRequest(u.id)}
                  disabled={pendingIds.has(u.id)}
                  className="text-xs bg-[#1877f2] text-white rounded px-2 py-1 shrink-0 disabled:opacity-50"
                >
                  Add
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm">Loading...</p>
      ) : (
        <>
          {incoming.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="font-semibold text-lg mb-3">
                Friend requests ({incoming.length})
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {incoming.map((u) => (
                  <div
                    key={u.id}
                    className="border border-gray-100 rounded-lg p-3 flex flex-col gap-2"
                  >
                    <Link href={`/profile/${u.username}`} className="flex items-center gap-2">
                      <Avatar name={u.name} avatarUrl={u.avatarUrl} size={40} />
                      <span className="text-sm font-medium">{u.name}</span>
                    </Link>
                    <div className="flex gap-2">
                      <button
                        onClick={() => respond(u.id, "accept")}
                        className="flex-1 bg-[#1877f2] text-white text-sm font-semibold rounded-lg py-1.5"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => respond(u.id, "decline")}
                        className="flex-1 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg py-1.5"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="font-semibold text-lg mb-3">
              Your friends ({friends.length})
            </h2>
            {friends.length === 0 ? (
              <p className="text-sm text-gray-400">
                You haven&apos;t added any friends yet.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {friends.map((u) => (
                  <div
                    key={u.id}
                    className="border border-gray-100 rounded-lg p-3 flex items-center justify-between gap-2"
                  >
                    <Link href={`/profile/${u.username}`} className="flex items-center gap-2 min-w-0">
                      <Avatar name={u.name} avatarUrl={u.avatarUrl} size={40} />
                      <span className="text-sm font-medium truncate">{u.name}</span>
                    </Link>
                    <button
                      onClick={() => removeFriendOrCancel(u.id)}
                      className="text-xs text-gray-500 hover:text-red-600 shrink-0"
                    >
                      Unfriend
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {outgoing.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="font-semibold text-lg mb-3">Requests sent</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {outgoing.map((u) => (
                  <div
                    key={u.id}
                    className="border border-gray-100 rounded-lg p-3 flex items-center justify-between gap-2"
                  >
                    <Link href={`/profile/${u.username}`} className="flex items-center gap-2 min-w-0">
                      <Avatar name={u.name} avatarUrl={u.avatarUrl} size={40} />
                      <span className="text-sm font-medium truncate">{u.name}</span>
                    </Link>
                    <button
                      onClick={() => removeFriendOrCancel(u.id)}
                      className="text-xs text-gray-500 hover:text-red-600 shrink-0"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
