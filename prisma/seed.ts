// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  // Step 1: Clear existing data (optional)
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Step 2: Seed Categories
  const mathsCategory = await prisma.category.create({
    data: { name: "Maths" },
  });
  const historyCategory = await prisma.category.create({
    data: { name: "History" },
  });
  const gkCategory = await prisma.category.create({
    data: { name: "General Knowledge" },
  });

  // Step 3: Seed Questions
  const questions = [
    // Maths Questions
    { text: "What is 5 + 7?", categoryId: mathsCategory.id },
    { text: "What is the value of π (pi) to two decimal places?", categoryId: mathsCategory.id },
    { text: "What is the square root of 16?", categoryId: mathsCategory.id },
    // History Questions
    { text: "Who was the first President of the United States?", categoryId: historyCategory.id },
    { text: "In which year did World War II end?", categoryId: historyCategory.id },
    { text: "Who discovered America in 1492?", categoryId: historyCategory.id },
    // General Knowledge Questions
    { text: "What is the largest planet in our solar system?", categoryId: gkCategory.id },
    { text: "Which gas makes up most of Earth’s atmosphere?", categoryId: gkCategory.id },
    { text: "What is the capital city of Brazil?", categoryId: gkCategory.id },
  ];

  await prisma.question.createMany({
    data: questions,
  });

  // Optional: Seed a sample user and answers
  const sampleUser = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      password: "hashedpassword123", // Replace with a real hashed password in production
      role: "USER",
    },
  });

  const seededQuestions = await prisma.question.findMany();
  await prisma.answer.createMany({
    data: [
      { text: "12", correct: true, userId: sampleUser.id, questionId: seededQuestions[0].id }, // 5 + 7
      { text: "3.14", correct: true, userId: sampleUser.id, questionId: seededQuestions[1].id }, // π
      { text: "4", correct: true, userId: sampleUser.id, questionId: seededQuestions[2].id }, // √16
    ],
  });

  console.log("Successfully seeded database with categories, questions, and sample data!");
}

seed()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });