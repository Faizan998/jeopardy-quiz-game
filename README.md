# Jeopardy Quiz Game

A full-featured Jeopardy-style quiz game built with Next.js, Prisma, and Tailwind CSS.

## Features

- User authentication (login, signup, password reset)
- Interactive quiz game with categories and questions
- Leaderboard to track top players
- Admin dashboard for managing questions and categories
- Responsive design with animations

## Prerequisites

- Node.js 18+ and npm
- Git

## Setup Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
cd jeopardy-quiz-game
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up the database**

The project uses SQLite for local development by default. To set up the database:

```bash
# Initialize the database with migrations
npm run db:migrate

# Seed the database with test data
npm run seed
```

4. **Start the development server**

```bash
npm run dev
```

The application will be available at http://localhost:3000.

## Test Accounts

For testing purposes, the following accounts are available after seeding:

- **Regular User**:
  - Email: test@example.com
  - Password: password123

- **Admin User**:
  - Email: admin@example.com
  - Password: password123

## Database Management

- **Reset the database**: `npm run db:reset`
- **View the database**: `npm run db:studio`

## Deployment

For production deployment, update the `.env` file to use a PostgreSQL database:

1. Uncomment the PostgreSQL connection string in `.env`
2. Comment out the SQLite connection string
3. Update the database provider in `prisma/schema.prisma` from `sqlite` to `postgresql`
4. Run migrations for production: `npx prisma migrate deploy`

## Troubleshooting

If you encounter database connection issues:

1. Make sure your database is running and accessible
2. Check the connection string in `.env`
3. Try using the SQLite database for local development
4. Reset the database with `npm run db:reset`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
"# jeopardy-quiz" 
"# jeopardy-quiz-game" 
