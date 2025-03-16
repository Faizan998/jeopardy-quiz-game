import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Define types for our sample questions
interface QuestionData {
  value: string;
  options: string;
  correctIdx: number;
}

interface CategoryQuestions {
  [key: string]: QuestionData[];
}

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.answer.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared existing data');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      totalAmount: 1000,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'USER',
      totalAmount: 500,
    },
  });

  console.log('Created users:', { adminUser: adminUser.id, regularUser: regularUser.id });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'History' },
    }),
    prisma.category.create({
      data: { name: 'Science' },
    }),
    prisma.category.create({
      data: { name: 'Geography' },
    }),
    prisma.category.create({
      data: { name: 'Entertainment' },
    }),
    prisma.category.create({
      data: { name: 'Sports' },
    }),
  ]);

  console.log('Created categories:', categories.map(c => c.name));

  // Create questions for each category
  const amounts = [100, 200, 300, 400, 500];

  // Sample questions for each category
  const sampleQuestions: CategoryQuestions = {
    'History': [
      {
        value: 'Who was the first President of the United States?',
        options: 'George Washington,Thomas Jefferson,Abraham Lincoln,John Adams',
        correctIdx: 0
      },
      {
        value: 'In which year did World War II end?',
        options: '1943,1945,1947,1950',
        correctIdx: 1
      },
      {
        value: 'Which ancient civilization built the pyramids at Giza?',
        options: 'Romans,Greeks,Egyptians,Persians',
        correctIdx: 2
      },
      {
        value: 'Who wrote the Declaration of Independence?',
        options: 'Thomas Jefferson,Benjamin Franklin,John Adams,George Washington',
        correctIdx: 0
      },
      {
        value: 'Which empire was ruled by Genghis Khan?',
        options: 'Ottoman Empire,Roman Empire,Mongol Empire,Byzantine Empire',
        correctIdx: 2
      }
    ],
    'Science': [
      {
        value: 'What is the chemical symbol for gold?',
        options: 'Au,Ag,Fe,Pb',
        correctIdx: 0
      },
      {
        value: 'What is the closest planet to the Sun?',
        options: 'Venus,Mercury,Earth,Mars',
        correctIdx: 1
      },
      {
        value: 'What is the hardest natural substance on Earth?',
        options: 'Platinum,Titanium,Diamond,Quartz',
        correctIdx: 2
      },
      {
        value: 'What is the largest organ in the human body?',
        options: 'Liver,Brain,Skin,Heart',
        correctIdx: 2
      },
      {
        value: 'Who developed the theory of relativity?',
        options: 'Albert Einstein,Isaac Newton,Stephen Hawking,Niels Bohr',
        correctIdx: 0
      }
    ]
  };

  for (const category of categories) {
    for (let i = 0; i < amounts.length; i++) {
      const amount = amounts[i];
      
      // Get sample question if available, otherwise create a generic one
      let questionData: QuestionData;
      if (sampleQuestions[category.name] && sampleQuestions[category.name][i]) {
        questionData = sampleQuestions[category.name][i];
      } else {
        // Generic question
        questionData = {
          value: `${category.name} question for $${amount}`,
          options: `${category.name} Option A,${category.name} Option B,${category.name} Option C,${category.name} Option D`,
          correctIdx: Math.floor(Math.random() * 4)
        };
      }
      
      // Create the question in the database using a raw query to avoid type issues
      await prisma.$executeRaw`
        INSERT INTO "Question" (
          "id", "value", "options", "amount", "CorrectIdx", "categoryId", "created_at", "updated_at"
        ) VALUES (
          ${`question-${category.id}-${amount}`}, 
          ${questionData.value}, 
          ${questionData.options}, 
          ${amount}, 
          ${questionData.correctIdx}, 
          ${category.id}, 
          ${new Date()}, 
          ${new Date()}
        )
      `;
    }
  }

  console.log('Created questions');

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
