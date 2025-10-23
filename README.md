# Full-Stack TypeScript Monorepo Template

A ready-to-use monorepo template for building full-stack TypeScript applications. Featuring a React frontend (with Vite) and an Express backend, all managed with [Turborepo](https://turbo.build/repo).

## What's inside?

This template includes the following packages/apps:

### Apps

- `web`: A Vite powered React application for the frontend.
- `api`: An Express server for the backend.

### Tech Stack

- **Monorepo:** Turborepo
- **Frontend:** React, Vite, TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Package Manager:** npm

## Getting Started

To get a new project up and running on your local machine, follow these steps.

### Prerequisites

Make sure you have Node.js and npm installed on your system. It's recommended to use the versions specified in the root `package.json`.

- Node.js (check `package.json` for `packageManager` to see the recommended npm version, which implies a Node.js version)
- npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  Install dependencies from the root of the monorepo:
    ```bash
    npm install
    ```

### Running in Development Mode

To start both the frontend and backend applications in development mode with hot-reloading, run the following command from the root directory:

```bash
npm run dev
```

This uses Turborepo to run the `dev` script in both the `api` and `web` packages simultaneously.

## Available Scripts

From the root directory, you can run the following scripts:

- `npm run dev`: Starts the development servers for all apps.
- `npm run build`: Builds all apps for production.
- `npm run clean`: Removes build artifacts (`dist`, `.next`, etc.) from all packages.
