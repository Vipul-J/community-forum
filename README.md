# Community Forums

A fullstack web application where users can sign up, create forums, and interact through comments/questions—similar to GitHub Discussions.

## Features

- **Authentication**: Users can sign up and sign in using NextAuth.js with Google and GitHub providers, or with email and password
- **Forums**: Users can create, update, and delete their own forums with titles, descriptions, and optional tags
- **Comments**: Users can comment on forums and delete their own comments
- **Likes**: Users can like/unlike forums
- **User Profiles**: View a user's forums and comments

## Tech Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Material UI
- NextAuth.js for authentication

### Backend
- Next.js API Routes
- PostgreSQL database
- Prisma ORM

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/community-forums.git
   cd community-forums
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the `.env.example` file to `.env` and fill it with your configuration:
   ```bash
   cp .env.example .env
   ```

4. Set up your database and update the `DATABASE_URL` in the `.env` file.

5. Run Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This application can be easily deployed using Vercel:

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Configure the environment variables.
4. Deploy!


```

