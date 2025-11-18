"use client"

import { useState, useEffect } from 'react';
import { MousePointer, Loader2, File, Terminal, Sparkles, Check } from 'lucide-react';

function InteractiveDemo() {
  const [step, setStep] = useState(0);
  const [text, setText] = useState("");
  const fullText = "Change headline to 'Built for Developers' with a gradient";

  useEffect(() => {
    if (step === 1) {
      let i = 0;
      setText("");
      const interval = setInterval(() => {
        setText(fullText.slice(0, i + 1));
        i++;
        if (i === fullText.length) {
          clearInterval(interval);
          setTimeout(() => setStep(2), 800);
        }
      }, 40);
      return () => clearInterval(interval);
    }
    if (step === 2) {
       const timer = setTimeout(() => {
          setStep(3);
       }, 2500);
       return () => clearTimeout(timer);
    }
  }, [step]);

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStep(0);
    setText("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl relative group select-none">
      {/* Mock Browser Header */}
      <div className="h-10 bg-neutral-900/50 border-b border-neutral-800 flex items-center px-4 gap-2">
         <div className="flex gap-1.5">
           <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
           <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
           <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
         </div>
         <div className="ml-4 px-3 py-1 rounded-md bg-black/40 text-xs text-neutral-500 font-mono flex-1 border border-neutral-800/50 flex items-center justify-between">
            <span>localhost:3000</span>
            {step === 3 && (
               <button 
                  onClick={handleReset}
                  className="hover:text-white transition-colors"
               >
                  ↺
               </button>
            )}
         </div>
      </div>

      {/* Mock Content */}
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] relative bg-black/20" onClick={() => step === 0 && setStep(1)}>
         <div className={`
            transition-all duration-500 ease-out p-4 rounded-xl border-2
            ${step === 0 ? 'border-transparent hover:border-blue-500/30 hover:bg-blue-500/5 cursor-pointer' : ''}
            ${step === 1 || step === 2 ? 'border-blue-500 bg-blue-500/10' : ''}
            ${step === 3 ? 'border-transparent' : ''}
         `}>
           <h3 className={`
              text-4xl md:text-5xl font-bold tracking-tight transition-all duration-700
              ${step === 3 ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 scale-110' : 'text-white'}
           `}>
              {step === 3 ? "Built for Developers" : "Hello World"}
           </h3>
         </div>
         
         {step < 3 && (
            <p className="text-neutral-500 mt-8 text-sm animate-pulse">
               {step === 0 ? "Click the headline to edit" : "Processing..."}
            </p>
         )}

         {/* Mock Cursor */}
         <div className={`
            absolute transition-all duration-700 ease-in-out pointer-events-none z-20
            ${step === 0 ? 'top-[60%] left-[60%] opacity-100' : ''}
            ${step === 1 || step === 2 ? 'top-[45%] left-[52%] opacity-100' : ''}
            ${step === 3 ? 'top-[80%] left-[80%] opacity-0' : ''}
         `}>
            <MousePointer className="w-6 h-6 text-white fill-black drop-shadow-xl" />
         </div>
      </div>

      {/* Toolbar Overlay */}
      <div className={`
         absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg transition-all duration-500 ease-out
         ${step > 0 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}
      `}>
         <div className="bg-black/80 backdrop-blur-xl border border-neutral-800 rounded-xl shadow-2xl p-4 space-y-4 ring-1 ring-white/10">
            {/* Element Context */}
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono border-b border-neutral-800/50 pb-3">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  <span className="text-blue-200 font-semibold">h3.font-bold</span>
                  <span className="text-neutral-600">src/app/page.tsx:42</span>
               </div>
               <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-neutral-800" />
                  <div className="w-2 h-2 rounded-full bg-neutral-800" />
               </div>
            </div>

            {/* Input Area */}
            <div className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
               <div className="relative flex items-center gap-3 bg-neutral-950 rounded-lg p-3 border border-neutral-800">
                  <Sparkles className={`w-4 h-4 ${step >= 2 ? 'text-purple-400 animate-pulse' : 'text-neutral-600'}`} />
                  <div className="flex-1 text-sm text-neutral-200 font-mono min-h-[20px] flex items-center">
                     {text}
                     {(step === 1) && <span className="animate-pulse ml-0.5 text-blue-400">▋</span>}
                  </div>
               </div>
            </div>

            {/* AI Steps */}
            <div className={`space-y-2 transition-all duration-500 overflow-hidden ${step >= 2 ? 'max-h-[100px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
               <div className="flex items-center gap-3 text-xs text-neutral-300">
                  <div className="w-5 flex justify-center">
                     {step === 2 ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" /> : <Check className="w-3.5 h-3.5 text-green-400" />}
                  </div>
                  <span>Reading <span className="text-neutral-500">page.tsx</span>...</span>
               </div>
               <div className={`flex items-center gap-3 text-xs text-neutral-300 transition-all duration-500 delay-700 ${step >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                   <div className="w-5 flex justify-center">
                     {step === 2 ? <Terminal className="w-3.5 h-3.5 animate-pulse text-purple-400" /> : <Check className="w-3.5 h-3.5 text-green-400" />}
                   </div>
                   <span>Generating changes...</span>
               </div>
               <div className={`flex items-center gap-3 text-xs text-neutral-300 transition-all duration-500 delay-1000 ${step >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                   <div className="w-5 flex justify-center">
                     {step === 2 ? <File className="w-3.5 h-3.5 animate-pulse text-yellow-400" /> : <Check className="w-3.5 h-3.5 text-green-400" />}
                   </div>
                   <span>Updating file...</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground transition-colors duration-300 flex flex-col selection:bg-blue-500/30">
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-to-b from-black via-black/90 to-[#0A0A0A] pointer-events-none"></div>
      
      <main className="flex-1 pt-32 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto px-6 space-y-24">

          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-400 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              Now available in public beta
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              Your AI coding agent,<br />
              living in your browser.
            </h1>
            <div className="space-y-6 text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
              <p>
                Flycli understands your codebase and edits your local files directly from your browser. No more context switching.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 pt-4">
               <a href="#setup" className="px-8 py-3 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 transition-colors">
                  Get Started
               </a>
               <a href="https://github.com/shujanshaikh/flycli" target="_blank" rel="noreferrer" className="px-8 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors">
                  View on GitHub
               </a>
            </div>
          </div>

          <InteractiveDemo />

          <section className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
               <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
               <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-widest">Prerequisites</h2>
               <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
               <div className="p-6 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="text-lg font-semibold text-white mb-2">Node.js</div>
                  <p className="text-neutral-400 text-sm">Version 18 or higher required for running the runtime environment.</p>
               </div>
               <div className="p-6 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="text-lg font-semibold text-white mb-2">Bun</div>
                  <p className="text-neutral-400 text-sm">Version 1.2.22+ required. Fast all-in-one JavaScript runtime.</p>
               </div>
               <div className="p-6 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="text-lg font-semibold text-white mb-2">AI Gateway</div>
                  <p className="text-neutral-400 text-sm">API Key required for enabling AI agent capabilities.</p>
               </div>
            </div>
          </section>

          <section id="setup" className="space-y-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">Local Setup</h2>

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-neutral-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                   <span className="font-mono text-sm font-bold">1</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border border-white/5 bg-neutral-900/50 hover:border-white/10 transition-colors">
                  <h3 className="text-lg font-medium text-white mb-4">Clone the Repository</h3>
                  <div className="relative group/code">
                    <pre className="bg-black/50 border border-white/5 rounded-lg p-4 overflow-x-auto">
                      <code className="text-sm text-neutral-300 font-mono">
                        {`git clone https://github.com/shujanshaikh/flycli.git\ncd flycli`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-neutral-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                   <span className="font-mono text-sm font-bold">2</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border border-white/5 bg-neutral-900/50 hover:border-white/10 transition-colors">
                  <h3 className="text-lg font-medium text-white mb-4">Install Dependencies</h3>
                  <pre className="bg-black/50 border border-white/5 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-neutral-300 font-mono">
                      {`bun install`}
                    </code>
                  </pre>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-neutral-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                   <span className="font-mono text-sm font-bold">3</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border border-white/5 bg-neutral-900/50 hover:border-white/10 transition-colors">
                  <h3 className="text-lg font-medium text-white mb-4">Build the Project</h3>
                  <pre className="bg-black/50 border border-white/5 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-neutral-300 font-mono">
                      {`# Build everything\nbun run build\n\n# Or build specific packages\nturbo build --filter=cli\nturbo build --filter=toolbar`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">Using flycli</h2>

            <div className="grid gap-6">
              <div className="p-6 rounded-xl border border-white/5 bg-neutral-900/50">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 shrink-0">
                    <span className="font-mono text-sm font-bold text-blue-400">1</span>
                  </div>
                  <div className="space-y-3 w-full">
                    <h3 className="text-lg font-medium text-white">Link flycli Locally</h3>
                    <p className="text-neutral-400 text-sm">
                      Link the package globally so it can be used in other projects.
                    </p>
                    <pre className="bg-black/50 border border-white/5 rounded-lg p-4 overflow-x-auto">
                      <code className="text-sm text-neutral-300 font-mono">
                        {`cd apps/cli\nbun link\n\n# In your target project\nbun link flycli`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-white/5 bg-neutral-900/50">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 shrink-0">
                    <span className="font-mono text-sm font-bold text-purple-400">2</span>
                  </div>
                  <div className="space-y-3 w-full">
                    <h3 className="text-lg font-medium text-white">Configure Environment</h3>
                    <p className="text-neutral-400 text-sm">
                      Add your AI Gateway API key to your project&apos;s <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-xs">.env.local</code> file.
                    </p>
                    <pre className="bg-black/50 border border-white/5 rounded-lg p-4 overflow-x-auto">
                      <code className="text-sm text-neutral-300 font-mono">
                        {`AI_GATEWAY_API_KEY=your_key_here`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-white/5 bg-neutral-900/50">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 shrink-0">
                    <span className="font-mono text-sm font-bold text-green-400">3</span>
                  </div>
                  <div className="space-y-3 w-full">
                    <h3 className="text-lg font-medium text-white">Start Developing</h3>
                    <p className="text-neutral-400 text-sm">
                      Run your app and flycli in separate terminals.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-xs text-neutral-500 font-mono uppercase tracking-wider">Terminal 1</div>
                        <pre className="bg-black/50 border border-white/5 rounded-lg p-3 overflow-x-auto h-full">
                          <code className="text-sm text-neutral-300 font-mono">
                            {`bun run dev`}
                          </code>
                        </pre>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs text-neutral-500 font-mono uppercase tracking-wider">Terminal 2</div>
                        <pre className="bg-black/50 border border-white/5 rounded-lg p-3 overflow-x-auto h-full">
                          <code className="text-sm text-neutral-300 font-mono">
                            {`bunx flycli`}
                          </code>
                        </pre>
                      </div>
                    </div>
                    <p className="text-neutral-400 text-sm pt-2">
                      Visit <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-xs">http://localhost:3100</code> to see the toolbar.
                    </p>
                  </div>
                </div>
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
            <h2 className="text-2xl font-semibold text-white">Element Selection</h2>
            <p className="text-neutral-200">
              If you want to implement element selection functionality in your project, use{" "}
              <a 
                href="https://www.react-grab.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                React Grab
              </a>{" "}
              by Aiden Bai. React Grab provides powerful element selection capabilities for React applications.
            </p>
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

      <footer className="py-12 border-t border-neutral-900">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
                <Terminal className="w-3.5 h-3.5 text-white" />
             </div>
             <span className="font-semibold text-white tracking-tight">flycli</span>
          </div>
          <p className="text-sm text-neutral-500">
            MIT License &copy; {new Date().getFullYear()} Flycli
          </p>
        </div>
      </footer>
    </div>
  )
}
