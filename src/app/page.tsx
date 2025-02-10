"use client";

import { Project } from "@/types";
import { ProjectTable } from "@/components/ProjectTable";
import { Analytics } from "@/components/Analytics";
import { SectionSelector } from "@/components/SectionSelector";
import { useState, useEffect } from "react";
import { getBeraPrice } from "@/lib/utils";

async function fetchProjects(): Promise<Project[]> {
  const response = await fetch("/api/projects");
  if (!response.ok) {
    console.error("Failed to fetch projects");
    return [];
  }
  return response.json();
}

export default function Home() {
  const [activeSection, setActiveSection] = useState<"table" | "analytics">(
    "table"
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [beraPrice, setBeraPrice] = useState(0);

  useEffect(() => {
    Promise.all([fetchProjects(), getBeraPrice()])
      .then(([projectsData, price]) => {
        setProjects(projectsData);
        setBeraPrice(price);
      })
      .finally(() => setIsLoading(false));

    // Refresh price every minute
    const interval = setInterval(async () => {
      const price = await getBeraPrice();
      setBeraPrice(price);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] py-12">
      <div className="container mx-auto px-4 max-w-6xl flex flex-col min-h-screen">
        <div className="mb-16 text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold">
              <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 bg-clip-text text-transparent">
                Berachain RFA
              </span>
            </h1>
            <h2 className="text-4xl font-bold text-[hsl(var(--foreground))]">
              Allocations Explorer
            </h2>
          </div>

          <p className="text-[hsl(var(--muted-foreground))] text-lg max-w-2xl mx-auto leading-relaxed">
            Explore projects that received BERA token allocations through the
            RFA program. ~82.5% of tokens will be used for rewards.
          </p>

          <div className="flex justify-center">
            <a
              href="https://twitter.com/0x_ultra"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500/90 via-yellow-500/90 to-amber-500/90 text-black hover:text-black hover:scale-[1.02] shadow-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-200 font-medium"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-0 group-hover:opacity-100 blur transition-opacity" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-0 group-hover:opacity-50 transition-opacity" />
              <svg
                className="w-5 h-5 relative z-10 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[-4deg]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="relative z-10 font-semibold tracking-wide transition-transform duration-200 group-hover:scale-105">
                @0x_ultra
              </span>
            </a>
          </div>

          <SectionSelector
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </div>

        {isLoading ? (
          <div className="text-center text-[hsl(var(--muted-foreground))] p-12 bg-[hsl(var(--muted))] rounded-lg">
            Loading projects...
          </div>
        ) : projects.length > 0 ? (
          activeSection === "table" ? (
            <ProjectTable projects={projects} />
          ) : (
            <Analytics projects={projects} beraPrice={beraPrice} />
          )
        ) : (
          <div className="text-center text-[hsl(var(--muted-foreground))] p-12 bg-[hsl(var(--muted))] rounded-lg">
            No allocation data available at the moment.
          </div>
        )}

        <footer className="mt-auto pt-12 pb-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[hsl(var(--muted-foreground))] text-sm">
            <a
              href="https://github.com/xultradotfun/bera-rfa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--muted))] hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>Found an issue? Submit a PR</span>
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
