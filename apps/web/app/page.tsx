"use client"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-foreground transition-colors duration-300 flex flex-col">
      <main className="flex-1 pt-20 pb-20">
        <div className="max-w-4xl mx-auto px-6 space-y-16">

          <div className="text-center space-y-6">
            <h1 className="text-3xl flycli-text md:text-4xl font-semibold tracking-tight text-balance leading-tight">
              Your ai coding agent, that lives in your browser
            </h1>
            <div className="space-y-4 text-sm md:text-base text-neutral-200 leading-relaxed max-w-2xl mx-auto">
              <p>
                Flycli is your in-browser AI coding agent that understands your codebase, and edits your local files directly.
              </p>
              <p>
                No more switching between tools, copying code snippets, or context switching.
              </p>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Prerequisites</h2>
            <ul className="space-y-2 text-neutral-200 list-disc list-inside">
              <li><strong className="text-white">Node.js</strong>: &gt;= 18</li>
              <li><strong className="text-white">Bun</strong>: &gt;= 1.2.22 (package manager)</li>
              <li><strong className="text-white">AI Gateway API Key</strong>: Required for AI agent functionality</li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Local Setup</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">1. Clone the Repository</h3>
                <pre className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-neutral-100 font-mono">
                    {`git clone <repository-url>
cd flycli`}
                  </code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">2. Install Dependencies</h3>
                <pre className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-neutral-100 font-mono">
                    {`bun install`}
                  </code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">3. Build the Project</h3>
                <pre className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-neutral-100 font-mono">
                    {`# Build everything
bun run build

# Or build specific packages
turbo build --filter=cli
turbo build --filter=toolbar
turbo build --filter=agent`}
                  </code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">4. Run Development Mode</h3>
                <pre className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-neutral-100 font-mono">
                    {`# Start all apps
bun run dev

# Or run specific apps
turbo dev --filter=cli
turbo dev --filter=toolbar`}
                  </code>
                </pre>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Using flycli in Your Project</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Step 1: Link flycli Locally</h3>
                <p className="text-neutral-200 mb-3">
                  Link the package globally (from the flycli repository):
                </p>
                <pre className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-neutral-100 font-mono">
                    {`cd apps/cli
bun link`}
                  </code>
                </pre>
                <p className="text-neutral-200 mt-3 text-sm">
                  This registers the <code className="bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-100 font-mono text-xs">flycli</code> package globally so it can be used in other projects.
                </p>
                <p className="text-neutral-200 mt-3 text-sm">
                  In your project (where you want to use flycli), link the package:
                </p>
                <pre className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 overflow-x-auto mt-2">
                  <code className="text-sm text-neutral-100 font-mono">
                    {`# From your project directory
bun link flycli`}
                  </code>
                </pre>
                <p className="text-neutral-300 mt-3 text-sm italic">
                  Note: You need to link the package in each project where you want to use it. This only needs to be done once per project.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Step 2: Configure Your Project</h3>
                <p className="text-neutral-200 mb-3">
                  Set up environment variables in your project. Create a <code className="bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-100 font-mono text-xs">.env</code> file in your project root:
                </p>
                <pre className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-neutral-100 font-mono">
                    {`AI_GATEWAY_API_KEY=your_ai_gateway_api_key_here`}
                  </code>
                </pre>
                <p className="text-neutral-300 mt-3 text-sm italic">
                  Note: The AI Gateway API key should be set in the project where you want to use flycli, not in the flycli repository itself.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Step 3: Start Your Application</h3>
                <p className="text-neutral-200 mb-3">
                  Start your Next.js app in one terminal:
                </p>
                <pre className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-neutral-100 font-mono">
                    {`bun run dev
# or
next dev`}
                  </code>
                </pre>
                <p className="text-neutral-200 mt-3 mb-3">
                  Start flycli in another terminal:
                </p>
                <pre className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-neutral-100 font-mono">
                    {`bunx flycli`}
                  </code>
                </pre>
                <p className="text-neutral-200 mt-3">
                  Access the toolbar: Open your browser and navigate to <code className="bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-100 font-mono text-xs">http://localhost:3100</code>. flycli will proxy your Next.js app (running on port 3000) and overlay the AI toolbar.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Project Structure</h2>
            <pre className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 overflow-x-auto">
              <code className="text-sm text-neutral-300">
                {`flycli/
├── apps/
│   ├── agent/          # AI agent package
│   ├── cli/            # CLI tool
│   ├── toolbar/        # React toolbar UI
│   └── web/            # Example Next.js app
├── packages/
│   ├── eslint-config/  # Shared ESLint config
│   ├── typescript-config/ # Shared TS config
└── package.json        # Root package.json`}
              </code>
            </pre>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Available Scripts</h2>
            <ul className="space-y-2 text-neutral-200">
              <li><code className="bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-100 font-mono text-xs">bun run build</code> - Build all packages</li>
              <li><code className="bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-100 font-mono text-xs">bun run dev</code> - Start all apps in development mode</li>
              <li><code className="bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-100 font-mono text-xs">bun run lint</code> - Lint all packages</li>
              <li><code className="bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-100 font-mono text-xs">bun run format</code> - Format code with Prettier</li>
              <li><code className="bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-100 font-mono text-xs">bun run check-types</code> - Type check all packages</li>
            </ul>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-white mb-2">Building Specific Packages</h3>
              <pre className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-neutral-100 font-mono">
                  {`# Build CLI
turbo build --filter=cli

# Build toolbar
turbo build --filter=toolbar

# Build agent
turbo build --filter=agent`}
                </code>
              </pre>
            </div>
          </section>
                    
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">How It Works</h2>
            <ol className="space-y-3 text-neutral-200 list-decimal list-inside">
              <li><strong className="text-white">flycli starts a server</strong> on the specified port (default: 3100)</li>
              <li><strong className="text-white">It proxies requests</strong> to your Next.js app running on another port (default: 3000)</li>
              <li><strong className="text-white">The toolbar UI</strong> is served at the flycli port and overlays your app</li>
              <li><strong className="text-white">WebSocket connection</strong> enables real-time communication between the toolbar and the AI agent</li>
              <li><strong className="text-white">The AI agent</strong> can read files, edit code, search, and execute terminal commands in your workspace</li>
            </ol>
          </section>
        </div>
      </main>

      <footer className="flex items-center justify-center pb-8 px-6">
        <h2 className="watermark-bordered text-6xl md:text-8xl font-bold text-center -skew-x-6">
          flycli
        </h2>
      </footer>
    </div>
  )
}
