import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/app/lib/authOptions";

const prisma = new PrismaClient();

// ?This route is used to submit the answer for the question it also returns the answer obj

// takes two query params quesId and ansIndex
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log(session);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const quesId = searchParams.get("quesId");
    const ansIndex = searchParams.get("ansIndex");
    console.log(quesId, ansIndex);

    if (!quesId || !ansIndex) {
      return NextResponse.json(
        { error: "Question and Answer Index is required" },
        { status: 400 }
      );
    }

    // getting  user for checks
    //
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        Answer: true,
      },
    });

    // check if user has already answered the question
    if (user?.Answer.some((ans) => ans.questionId === quesId)) {
      return NextResponse.json(
        { error: "Question Already Answered" },
        { status: 400 }
      );
    }

    // get question
    const question = await prisma.question.findUnique({
      where: {
        id: quesId,
      },
    });

    // create answer for the user
    const answer = await prisma.answer.create({
      data: {
        userId: session.user.id,
        questionId: quesId,
        selectedIdx: ansIndex,
        isCorrect: parseInt(ansIndex) === question?.CorrectIdx,
      },
    });

    let updatedUser;
    if (answer.isCorrect) {
      //? may require more checks
      updatedUser = await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          totalAmount: {
            increment: question?.amount,
          },
        },
        omit: {
          password: true,
        },
      });
    }

    return NextResponse.json(
      { message: "Answer Submitted", data: { answer, updatedUser } },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}