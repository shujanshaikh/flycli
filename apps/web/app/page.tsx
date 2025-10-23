"use client"

export default function Home() {

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">


      <main className="flex-1 flex items-center justify-center pt-20 pb-20">
        <div className="max-w-2xl mx-auto px-6 text-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-3xl flycli-text md:text-4xl font-semibold tracking-tight text-balance leading-tight">
              Your ai coding agent, that lives in your browser
            </h1>

            <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
              <p>
              Flycli is your in-browser AI coding agent that understands your codebase, and edits your local files directly.
              </p>
              <p>
                No more switching between tools, copying code snippets, or context switching.
              </p>
            </div>
          </div>

          <div className="relative inline-block font-semibold text-2xl overflow-hidden -skew-x-6">
            <span className="animate-shimmer-text bg-gradient-to-r from-foreground via-pink-500 via-pink-600 to-foreground bg-[length:200%_100%] bg-clip-text text-transparent drop-shadow-lg opacity-80">
              Coming Soon
            </span>
          </div>
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
