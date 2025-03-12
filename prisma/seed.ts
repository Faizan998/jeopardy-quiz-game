

import quizData from "@/data/quizdata";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const { categories } = quizData;
  for (const category of categories) {
    await prisma.category.create({
      data: {
        name: category.name,
        questions: {
          createMany: {
            data: category.questions.map((question) => ({
              value: question.question,
              options: question.options,
              amount: question.amount,
              CorrectIdx: question.correctIndex,
            })),
          },
        },
      },
    });
  }
}

main()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
