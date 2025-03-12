// import { NextResponse } from "next/server";
// import prisma from "@/app/lib/prisma";

// export async function POST(req: Request) {
//   try {
//     // Define expected request body structure
//     const { questionId, selectedAnswerId, userId }: { questionId: string; selectedAnswerId: string; userId: string } =
//       await req.json();

//     if (!questionId || !selectedAnswerId || !userId) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }

//     // Find the correct answer
//     const correctAnswer = await prisma.answer.findFirst({
//       where: {
//         questionId,
//         correct: true,
//         userId: null, // Ensure it is a predefined correct answer
//       },
//     });

//     if (!correctAnswer) {
//       return NextResponse.json({ error: "No correct answer found" }, { status: 404 });
//     }

//     const isCorrect: boolean = correctAnswer.id === selectedAnswerId;

//     // Create a new answer record for the user (Assuming there is a valid field to store it)
//     await prisma.answer.create({
//       data: {
//         questionId,
//         userId, // Ensures proper user assignment
//         correct: isCorrect,
//         selectedAnswerId, // Store selected answer separately if text doesn't exist
//       },
//     });

//     // Update user score if the answer is correct
//     if (isCorrect) {
//       await prisma.user.update({
//         where: { id: userId },
//         data: { totalScore: { increment: 10 } },
//       });
//     }

//     return NextResponse.json({
//       isCorrect,
//       message: isCorrect ? "✅ Correct Answer!" : "❌ Wrong Answer!",
//       correctAnswer: correctAnswer.text, // Ensure `text` exists in the database schema
//     });
//   } catch (error: any) {
//     console.error("Error submitting answer:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }
