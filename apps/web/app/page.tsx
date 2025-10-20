import { Button } from "@repo/ui/button";
import { ArrowRight, Zap } from "lucide-react";

/**
 * @title Home Page Component
 * @description Renders a dark-mode-first, responsive landing page hero section.
 */
export default function Home(): React.JSX.Element {
  return (
    // Removed min-h-[calc(100vh)] and justify-center to allow content flow below the sticky NavBar
    // Added min-h-screen to ensure background fills the viewport height
    <main className="flex min-h-screen flex-col items-center bg-zinc-950 text-white dark:bg-zinc-950">
      {/* Background/Overlay Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 opacity-90"></div>

      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-32 text-center sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="mb-8 flex justify-center">
          <span className="inline-flex items-center rounded-full bg-zinc-800 px-4 py-1.5 text-sm font-medium text-zinc-300 ring-1 ring-inset ring-zinc-700 hover:ring-zinc-600 transition duration-300">
            <Zap className="h-4 w-4 mr-2 text-yellow-400" />
            New Feature: The future is now!
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl font-extrabold tracking-tight text-zinc-50 sm:text-7xl lg:text-8xl">
          Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">Blazing Fast</span>
          <br className="hidden sm:block" /> Applications
        </h1>

        {/* Subtitle / Description */}
        <p className="mt-6 text-xl text-zinc-400 sm:text-2xl max-w-3xl mx-auto">
          Expertly crafted with TypeScript, Next.js, and Tailwind CSS. Deploy
          production-ready code instantly with the power of the Monorepo.
        </p>

        {/* Call-to-Action Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Button
            appName="web"
            className="group w-full sm:w-auto flex items-center justify-center space-x-2 rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-blue-600/30 transition duration-300 hover:bg-blue-500 hover:shadow-blue-500/40"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>

          <Button
            appName="web"
            className="w-full sm:w-auto rounded-full border border-zinc-700 bg-zinc-800 px-8 py-3 text-lg font-semibold text-zinc-200 transition duration-300 hover:border-zinc-600 hover:bg-zinc-700"
          >
            View Documentation
          </Button>
        </div>
      </div>
      
      {/* Footer Content Example (Optional) */}
      <div className="relative z-10 py-12">
        <p className="text-sm text-zinc-600">
          A project by an idiot. Built with <span className="text-zinc-500">passion</span>.
        </p>
      </div>
    </main>
  );
}