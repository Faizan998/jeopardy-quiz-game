#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

/**
 * Execute a command and print the output
 */
function runCommand(command, options = {}) {
  console.log(`${colors.bright}${colors.blue}> ${command}${colors.reset}`);
  try {
    execSync(command, {
      stdio: 'inherit',
      ...options,
    });
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to execute ${command}${colors.reset}`);
    return false;
  }
}

/**
 * Print a section header
 */
function printHeader(text) {
  console.log(`\n${colors.bright}${colors.magenta}=== ${text} ===${colors.reset}\n`);
}

/**
 * Main setup function
 */
async function setup() {
  printHeader('Jeopardy Quiz Game Setup');
  console.log(`${colors.cyan}This script will help you set up the Jeopardy Quiz Game project.${colors.reset}\n`);

  // Check if .env file exists, create it if not
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    printHeader('Creating .env file');
    const envContent = `# Environment variables
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Use SQLite for local development to avoid connection issues
DATABASE_URL="file:./dev.db"

# Uncomment this line when deploying to production with PostgreSQL
# DATABASE_URL="postgresql://postgres:password@localhost:5432/jeopardy"

# JWT Secret Key for authentication
JWT_SECRET_KEY="your-secret-key-here-change-in-production"

# NextAuth Secret
NEXTAUTH_SECRET="your-nextauth-secret-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
`;
    fs.writeFileSync(envPath, envContent);
    console.log(`${colors.green}Created .env file${colors.reset}`);
  } else {
    console.log(`${colors.yellow}.env file already exists, skipping creation${colors.reset}`);
  }

  // Install dependencies
  printHeader('Installing dependencies');
  if (!runCommand('npm install')) {
    console.error(`${colors.red}Failed to install dependencies. Please try running 'npm install' manually.${colors.reset}`);
    process.exit(1);
  }

  // Set up the database
  printHeader('Setting up the database');
  console.log(`${colors.cyan}Generating Prisma client...${colors.reset}`);
  runCommand('npx prisma generate');

  console.log(`${colors.cyan}Running database migrations...${colors.reset}`);
  runCommand('npm run db:migrate');

  console.log(`${colors.cyan}Seeding the database with test data...${colors.reset}`);
  runCommand('npm run seed');

  // Success message
  printHeader('Setup Complete!');
  console.log(`${colors.green}The Jeopardy Quiz Game has been successfully set up.${colors.reset}\n`);
  console.log(`${colors.cyan}You can now start the development server with:${colors.reset}`);
  console.log(`${colors.bright}npm run dev${colors.reset}\n`);
  
  console.log(`${colors.cyan}Test accounts:${colors.reset}`);
  console.log(`${colors.yellow}Regular User:${colors.reset} test@example.com / password123`);
  console.log(`${colors.yellow}Admin User:${colors.reset} admin@example.com / password123\n`);
  
  console.log(`${colors.cyan}For more information, see the README.md file.${colors.reset}`);
}

// Run the setup
setup().catch((error) => {
  console.error(`${colors.red}Setup failed:${colors.reset}`, error);
  process.exit(1);
});