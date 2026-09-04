# Connectly

A Facebook-style social media web app: news feed, photo posts, likes, comments, friend requests, profiles, and notifications.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite
- NextAuth (Auth.js) credentials-based authentication

## Getting started

```bash
npm install
npm run db:push   # create the SQLite database from prisma/schema.prisma
npm run db:seed    # optional: seed demo users and posts
npm run dev
```

Copy `.env.example` to `.env` and adjust `AUTH_SECRET` for anything beyond local development.

Demo login (after seeding): `ada@example.com` / `password123`.

## Features

- Email/password auth with protected routes
- News feed with text + image posts
- Likes and comments
- Friend requests (send/accept/decline), friends list
- Profile pages with editable bio, avatar, and cover photo
- Notifications for likes, comments, and friend activity
- User search
