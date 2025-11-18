# flycli

Your AI coding agent that lives in your browser. flycli is a development tool that wraps your Next.js application with an AI-powered toolbar, enabling you to interact with your codebase using natural language.

## What's inside?

This Turborepo monorepo includes the following packages/apps:

### Apps

- **`cli`**: The main CLI tool that starts the flycli server and proxies your Next.js app
- **`agent`**: The AI agent package that handles code operations and tool execution
- **`toolbar`**: A React-based UI toolbar that provides the interface for interacting with the AI agent
- **`web`**: A Next.js web application (example app)

### Packages

- **`@repo/ui`**: Shared React component library
- **`@repo/eslint-config`**: ESLint configurations for the monorepo
- **`@repo/typescript-config`**: TypeScript configurations used throughout the monorepo



## Prerequisites

- **Node.js**: >= 18
- **Bun**: >= 1.2.22 (package manager)
- **AI Gateway API Key**: Required for AI agent functionality

## Local Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd flycli
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Build the Project

Build all apps and packages:

```bash
# Build everything
bun run build

# Or build specific packages
turbo build --filter=cli
turbo build --filter=toolbar
turbo build --filter=agent
```

### 4. Run Development Mode

Start all apps in development mode:

```bash
bun run dev
```

Or run specific apps:

```bash
# Run CLI only
turbo dev --filter=cli

# Run toolbar only
turbo dev --filter=toolbar
```

## Using flycli in Your Project

flycli is designed to wrap your existing Next.js application with an AI-powered development toolbar. Here's how to set it up:

### Step 1: Link flycli Locally

1. **Link the package globally** (from the flycli repository):

```bash
cd apps/cli
bun link
```

This registers the `flycli` package globally so it can be used in other projects.

2. **In your project** (where you want to use flycli), link the package:

```bash
# From your project directory
bun link flycli
```

> **Note:** You need to link the package in each project where you want to use it. This only needs to be done once per project.

### Step 2: Configure Your Project
1. **Set up environment variables in your project:**

Create a `.env` file in your project root (the project where you want to use the toolbar):

```bash
AI_GATEWAY_API_KEY=your_ai_gateway_api_key_here
```

> **Note:** The AI Gateway API key should be set in the project where you want to use flycli, not in the flycli repository itself.

### Step 3: Start Your Application

1. **Start your Next.js app** in one terminal:

```bash
bun run dev
# or
next dev
```

2. **Start flycli** in another terminal:

```bash
bunx flycli


3. **Access the toolbar:**

Open your browser and navigate to `http://localhost:3100`. flycli will proxy your Next.js app (running on port 3000) and overlay the AI toolbar.

### Project Structure

```
flycli/
├── apps/
│   ├── agent/          # AI agent package
│   ├── cli/            # CLI tool
│   ├── toolbar/        # React toolbar UI
│   └── web/            # Example Next.js app
├── packages/
│   ├── eslint-config/  # Shared ESLint config
│   ├── typescript-config/ # Shared TS config
└── package.json        # Root package.json
```

### Available Scripts

- `bun run build` - Build all packages
- `bun run dev` - Start all apps in development mode
- `bun run lint` - Lint all packages
- `bun run format` - Format code with Prettier
- `bun run check-types` - Type check all packages

### Building Specific Packages

```bash
# Build CLI
turbo build --filter=cli

# Build toolbar
turbo build --filter=toolbar

# Build agent
turbo build --filter=agent
```

## Element Selection

If you want to implement element selection functionality in your project, use **[React Grab](https://www.react-grab.com/)** by Aiden Bai. React Grab provides powerful element selection capabilities for React applications.

## How It Works

1. **flycli starts a server** on the specified port (default: 3100)
2. **It proxies requests** to your Next.js app running on another port (default: 3000)
3. **The toolbar UI** is served at the flycli port and overlays your app
4. **WebSocket connection** enables real-time communication between the toolbar and the AI agent
5. **The AI agent** can read files, edit code, search, and execute terminal commands in your workspace