// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function seed() {
//   // Step 1: Clear existing data
//   await prisma.answer.deleteMany();
//   await prisma.question.deleteMany();
//   await prisma.category.deleteMany();
//   await prisma.user.deleteMany();

//   // Step 2: Seed User
//   const user = await prisma.user.create({
//     data: {
//       email: "test@example.com",
//       name: "Test User",
//       password: "hashedpassword123", // Replace with a real hashed password in production
//       role: "USER",
//     },
//   });

//   // Step 3: Seed Categories
//   const mathsCategory = await prisma.category.create({ data: { name: "Maths" } });
//   const gkCategory = await prisma.category.create({ data: { name: "General Knowledge" } });
//   const scienceCategory = await prisma.category.create({ data: { name: "Science" } });

//   // Step 4: Seed Questions
//   const questions = await prisma.question.createMany({
//     data: [
//       // Maths Questions (9)
//       { text: "What is 5 + 7?", categoryId: mathsCategory.id },
//       { text: "What is the value of π (pi) to two decimal places?", categoryId: mathsCategory.id },
//       { text: "What is the square root of 16?", categoryId: mathsCategory.id },
//       { text: "What is 15 × 6?", categoryId: mathsCategory.id },
//       { text: "What is the perimeter of a square with side 4 cm?", categoryId: mathsCategory.id },
//       { text: "What is 100 divided by 4?", categoryId: mathsCategory.id },
//       { text: "What is 3² (3 squared)?", categoryId: mathsCategory.id },
//       { text: "If a triangle has angles 30° and 60°, what is the third angle?", categoryId: mathsCategory.id },
//       { text: "What is 2⁵ (2 raised to power 5)?", categoryId: mathsCategory.id },

//       // General Knowledge Questions (9)
//       { text: "What is the largest planet in our solar system?", categoryId: gkCategory.id },
//       { text: "Which gas makes up most of Earth’s atmosphere?", categoryId: gkCategory.id },
//       { text: "What is the capital city of Brazil?", categoryId: gkCategory.id },
//       { text: "Which is the longest river in the world?", categoryId: gkCategory.id },
//       { text: "How many continents are there?", categoryId: gkCategory.id },
//       { text: "Which is the tallest mountain in the world?", categoryId: gkCategory.id },
//       { text: "Who invented the telephone?", categoryId: gkCategory.id },
//       { text: "What is the chemical symbol for gold?", categoryId: gkCategory.id },
//       { text: "Which ocean is the largest?", categoryId: gkCategory.id },

//       // Science Questions (9)
//       { text: "What is the chemical formula of water?", categoryId: scienceCategory.id },
//       { text: "What planet is known as the Red Planet?", categoryId: scienceCategory.id },
//       { text: "What gas do plants absorb from the atmosphere?", categoryId: scienceCategory.id },
//       { text: "What part of the cell contains DNA?", categoryId: scienceCategory.id },
//       { text: "What force keeps us on the ground?", categoryId: scienceCategory.id },
//       { text: "What is the hardest natural substance on Earth?", categoryId: scienceCategory.id },
//       { text: "What is the powerhouse of the cell?", categoryId: scienceCategory.id },
//       { text: "What is the boiling point of water in Celsius?", categoryId: scienceCategory.id },
//       { text: "Which organ pumps blood in the human body?", categoryId: scienceCategory.id },
//     ],
//   });

//   const allQuestions = await prisma.question.findMany();

//   // Step 5: Seed Answers with userId
//   const answers = allQuestions.flatMap((q, index) => [
//     { questionId: q.id, text: "Correct Answer", correct: true, userId: user.id },
//     { questionId: q.id, text: "Wrong Answer 1", correct: false, userId: user.id },
//     { questionId: q.id, text: "Wrong Answer 2", correct: false, userId: user.id },
//     { questionId: q.id, text: "Wrong Answer 3", correct: false, userId: user.id },
//   ]);

//   await prisma.answer.createMany({ data: answers });

//   console.log("✅ Successfully seeded database with categories, questions, and answers!");
// }

// seed()
//   .catch((e) => {
//     console.error("❌ Error during seeding:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

import { PrismaClient, Category, Question } from "@prisma/client";

const prisma = new PrismaClient();

async function seed(): Promise<void> {
  try {
    await prisma.answer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany(); // Optional: If you also want to clear users

    // Create a user or fetch an existing one
    let user = await prisma.user.findFirst();

    if (!user) {
      user = await prisma.user.create({
        data: { name: "Test User", email: "test@example.com", password: "hashedpassword123" }, // Adjust fields as per your schema
      });
    }

    const mathsCategory: Category = await prisma.category.create({ data: { name: "Maths" } });
    const gkCategory: Category = await prisma.category.create({ data: { name: "General Knowledge" } });
    const scienceCategory: Category = await prisma.category.create({ data: { name: "Science" } });

    const questionsData = [
      {
        text: "What is 5 + 7?",
        categoryId: mathsCategory.id,
        userId: user.id, // Attach userId
        answers: [
          { text: "12", correct: true },
          { text: "10", correct: false },
          { text: "14", correct: false },
          { text: "11", correct: false },
        ],
      },
      {
        text: "What is the capital of France?",
        categoryId: gkCategory.id,
        userId: user.id, // Attach userId
        answers: [
          { text: "Paris", correct: true },
          { text: "London", correct: false },
          { text: "Berlin", correct: false },
          { text: "Madrid", correct: false },
        ],
      },
      {
        text: "What is H2O?",
        categoryId: scienceCategory.id,
        userId: user.id, // Attach userId
        answers: [
          { text: "Water", correct: true },
          { text: "Oxygen", correct: false },
          { text: "Hydrogen", correct: false },
          { text: "Carbon Dioxide", correct: false },
        ],
      },
    ];

    for (const question of questionsData) {
      const createdQuestion: Question = await prisma.question.create({
        data: {
          text: question.text,
          categoryId: question.categoryId,
          // userId: question.userId, // Add userId when creating the question
        },
      });

      await prisma.answer.createMany({
        data: question.answers.map((ans) => ({
          text: ans.text,
          correct: ans.correct,
          questionId: createdQuestion.id,
          userId: user.id,  // ✅ Add userId here
        })),
      });
    }      

    console.log("✅ Successfully seeded database with categories, questions, and answers!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

