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

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

## Prerequisites

- **Node.js**: >= 18
- **Bun**: >= 1.2.22 (package manager)
- **OpenAI API Key**: Required for AI agent functionality

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

1. **Create a configuration file** (`flycli.config.json`) in your project root:

```json
{
  "port": 3100,
  "appPort": 3000,
  "autoPlugins": true,
  "plugins": [],
  "eddyMode": "default"
}
```

2. **Set up environment variables in your project:**

Create a `.env` file in your project root (the project where you want to use the toolbar):

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

> **Note:** The OpenAI API key should be set in the project where you want to use flycli, not in the flycli repository itself.

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

# Or with custom ports
bunx flycli --port 3100 --app-port 3000
```

3. **Access the toolbar:**

Open your browser and navigate to `http://localhost:3100`. flycli will proxy your Next.js app (running on port 3000) and overlay the AI toolbar.

### Alternative: Use Built File Directly

If you prefer to use the built file directly instead of linking:

1. **Build flycli:**

```bash
cd apps/cli
bun run build
bun run build:toolbar
```

2. **Use the built file directly:**

```bash
# From your project directory
bun /path/to/flycli/apps/cli/dist/cli.js

# Or create a symlink
ln -s /path/to/flycli/apps/cli/dist/cli.js /usr/local/bin/flycli
```

### Configuration Options

The `flycli.config.json` file supports the following options:

- **`port`**: Port where flycli toolbar will run (default: 3100)
- **`appPort`**: Port where your Next.js app is running (default: 3000)
- **`autoPlugins`**: Automatically detect and load plugins (default: false)
- **`plugins`**: Array of plugin names to load
- **`eddyMode`**: Mode for the AI agent (default: "default")

### CLI Options

```bash
flycli [options]

Options:
  -p, --port [port]              Port for flycli toolbar (default: 3100)
  -a, --app-port <app-port>      Port of your Next.js app (default: 3000)
  -w, --workspace <workspace>     Path to your project workspace
  -s, --silent                   Suppress output messages
  -v, --verbose                  Show debug information
  -h, --help                     Display help
  -V, --version                  Display version
```

### Example Usage

```bash
# Basic usage (assumes Next.js on port 3000)
bunx flycli

# Custom ports
bunx flycli --port 3100 --app-port 3001

# Verbose mode for debugging
bunx flycli --verbose

# Specify workspace directory
bunx flycli --workspace /path/to/your/project
```

## Development

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
│   └── ui/             # Shared UI components
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

## How It Works

1. **flycli starts a server** on the specified port (default: 3100)
2. **It proxies requests** to your Next.js app running on another port (default: 3000)
3. **The toolbar UI** is served at the flycli port and overlays your app
4. **WebSocket connection** enables real-time communication between the toolbar and the AI agent
5. **The AI agent** can read files, edit code, search, and execute terminal commands in your workspace

## Troubleshooting

### Port Conflicts

If you encounter port conflicts, specify different ports:

```bash
bunx flycli --port 3101 --app-port 3001
```

### Missing API Key

Make sure `OPENAI_API_KEY` is set in your project's `.env` file (the project where you're using flycli, not the flycli repository):

```bash
# In your project's .env file
OPENAI_API_KEY=your_key_here
```

Or set it as an environment variable:

```bash
export OPENAI_API_KEY=your_key_here
```

### Toolbar Not Loading

1. Ensure the toolbar is built: `cd apps/toolbar && bun run build`
2. Check that your Next.js app is running on the correct port
3. Verify flycli is proxying correctly with `--verbose` flag

### `bunx flycli` Not Found

If you get `error: could not determine executable to run for package flycli`:

1. Make sure you've linked the package globally: `cd apps/cli && bun link`
2. Make sure you've linked it in your project: `bun link flycli` (from your project directory)
3. Verify the link worked by checking: `ls -la node_modules/.bin/flycli`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `bun run lint && bun run check-types`
5. Submit a pull request

## License

MIT

## Useful Links

- [Turborepo Documentation](https://turborepo.com/docs)
- [Bun Documentation](https://bun.sh/docs)
- [Next.js Documentation](https://nextjs.org/docs)
