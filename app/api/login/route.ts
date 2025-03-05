// import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import prisma from '../../lib/prisma';

// const JWT_SECRET = process.env.JWT_SECRET_KEY || "mysecretkey";

// export async function POST(req: Request) {
//   try {
//     const { email, password } = await req.json();

//     // Check if user exists
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
//     }

//     // Compare hashed password
//     if (!user.password) {
//       return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
//     }
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
//     }

//     // Generate JWT Token
//     const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
//       expiresIn: '7d',
//     });

//     return NextResponse.json({ message: 'Login successful', user, token }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
//   }
// }
