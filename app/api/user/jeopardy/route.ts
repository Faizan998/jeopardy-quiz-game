import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/app/lib/authOptions";
// route to get the jeopardy Table (with answered Table if any)
const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id; 
    
    // Did this queyr assuming JOINs are effecient and will not loop for each and every entry (answer of the question)
    const jeopardyData = await prisma.category.findMany({
      include: {
        questions: {
          include: {
            Answer: {
              where: {
                userId: userId,
              },
              select: {
                id: true, // Fetching only the existence of the answer
                isCorrect: true,
              },
            },
          },
        },
      },
    });

    // ?dev
    console.log(jeopardyData);

    // tranforming the  response to add isAnswered field to thte final res
    const formattedData = jeopardyData.map((category) => ({
      ...category,
      questions: category.questions.map((question) => ({
        ...question,
        isAnswered: question.Answer.length > 0, 
        isCorrect: question.Answer.length > 0 && question.Answer[0].isCorrect,
      })),
    }));

    // ?dev
    console.log(formattedData);

    return NextResponse.json(
      { message: "Jeopardy Table", jeopardyData: formattedData },
      { status: 200 }
    );
  } catch (error) {
    console.log('error',error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}