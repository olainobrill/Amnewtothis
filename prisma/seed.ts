import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const users = await Promise.all(
    [
      { name: "Ada Lovelace", username: "ada", email: "ada@example.com" },
      { name: "Grace Hopper", username: "grace", email: "grace@example.com" },
      { name: "Alan Turing", username: "alan", email: "alan@example.com" },
      { name: "Katherine Johnson", username: "katherine", email: "katherine@example.com" },
    ].map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          ...u,
          passwordHash,
          bio: `Hi, I'm ${u.name.split(" ")[0]}! 👋`,
        },
      })
    )
  );

  const [ada, grace, alan, katherine] = users;

  await prisma.friendship.upsert({
    where: { requesterId_addresseeId: { requesterId: ada.id, addresseeId: grace.id } },
    update: {},
    create: { requesterId: ada.id, addresseeId: grace.id, status: "ACCEPTED" },
  });
  await prisma.friendship.upsert({
    where: { requesterId_addresseeId: { requesterId: alan.id, addresseeId: ada.id } },
    update: {},
    create: { requesterId: alan.id, addresseeId: ada.id, status: "PENDING" },
  });

  const existingPosts = await prisma.post.count();
  if (existingPosts === 0) {
    const post1 = await prisma.post.create({
      data: {
        content: "Just shipped the analytical engine v2. Feeling great about it! ⚙️",
        authorId: ada.id,
      },
    });
    await prisma.like.create({ data: { postId: post1.id, userId: grace.id } });
    await prisma.comment.create({
      data: { content: "Incredible work as always!", postId: post1.id, authorId: grace.id },
    });

    await prisma.post.create({
      data: {
        content: "COBOL turns 65 this year. Still going strong. 💻",
        authorId: grace.id,
      },
    });

    await prisma.post.create({
      data: {
        content: "Thinking about machines that think...",
        authorId: alan.id,
      },
    });

    await prisma.post.create({
      data: {
        content: "Orbital mechanics never gets old. 🚀",
        authorId: katherine.id,
      },
    });
  }

  console.log("Seed complete. Demo login: ada@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
