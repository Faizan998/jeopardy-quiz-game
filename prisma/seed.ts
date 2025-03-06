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
    // Maths Questions (9)
    { text: "What is 5 + 7?", categoryId: mathsCategory.id },
    { text: "What is the value of π (pi) to two decimal places?", categoryId: mathsCategory.id },
    { text: "What is the square root of 16?", categoryId: mathsCategory.id },
    { text: "What is 15 × 6?", categoryId: mathsCategory.id },
    { text: "What is the perimeter of a square with side 4 cm?", categoryId: mathsCategory.id },
    { text: "What is 100 divided by 4?", categoryId: mathsCategory.id },
    { text: "What is 3² (3 squared)?", categoryId: mathsCategory.id },
    { text: "If a triangle has angles 30° and 60°, what is the third angle?", categoryId: mathsCategory.id },
    { text: "What is 2⁵ (2 raised to power 5)?", categoryId: mathsCategory.id },

    // History Questions (9)
    { text: "Who was the first President of the United States?", categoryId: historyCategory.id },
    { text: "In which year did World War II end?", categoryId: historyCategory.id },
    { text: "Who discovered America in 1492?", categoryId: historyCategory.id },
    { text: "Which country built the Great Wall?", categoryId: historyCategory.id },
    { text: "Who was the first man to walk on the moon?", categoryId: historyCategory.id },
    { text: "Which year did India gain independence?", categoryId: historyCategory.id },
    { text: "Who was the first Emperor of China?", categoryId: historyCategory.id },
    { text: "What year did the Titanic sink?", categoryId: historyCategory.id },
    { text: "Who was the Queen of England in 1600?", categoryId: historyCategory.id },

    // General Knowledge Questions (9)
    { text: "What is the largest planet in our solar system?", categoryId: gkCategory.id },
    { text: "Which gas makes up most of Earth’s atmosphere?", categoryId: gkCategory.id },
    { text: "What is the capital city of Brazil?", categoryId: gkCategory.id },
    { text: "Which is the longest river in the world?", categoryId: gkCategory.id },
    { text: "How many continents are there?", categoryId: gkCategory.id },
    { text: "Which is the tallest mountain in the world?", categoryId: gkCategory.id },
    { text: "Who invented the telephone?", categoryId: gkCategory.id },
    { text: "What is the chemical symbol for gold?", categoryId: gkCategory.id },
    { text: "Which ocean is the largest?", categoryId: gkCategory.id },
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

  console.log("✅ Successfully seeded database with categories, questions, and sample data!");
}

seed()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
