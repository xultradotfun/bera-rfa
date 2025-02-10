import { parse } from "csv-parse/sync";
import path from "path";
import { promises as fs } from "fs";
import { Project, CsvRecord } from "@/types";
import { ProjectTable } from "@/components/ProjectTable";

async function getProjects(): Promise<Project[]> {
  try {
    const csvPath = path.join(
      process.cwd(),
      "public",
      "data",
      "rfa_allocations.csv"
    );

    // Check if file exists
    try {
      await fs.access(csvPath);
    } catch {
      console.error("CSV file not found:", csvPath);
      return [];
    }

    const csvData = await fs.readFile(csvPath, "utf-8");

    if (!csvData.trim()) {
      console.error("CSV file is empty");
      return [];
    }

    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relaxColumnCount: true,
    }) as CsvRecord[];

    if (!Array.isArray(records) || records.length === 0) {
      console.error("No valid records found in CSV");
      return [];
    }

    return records
      .map((record) => ({
        projectName: record.project_name,
        beraAmount: parseFloat(record.bera_amount) || 0,
        twitterHandle: record.project_name.replace("@", ""),
      }))
      .sort((a: Project, b: Project) => {
        if (a.beraAmount === 0 && b.beraAmount === 0) {
          return a.projectName.localeCompare(b.projectName);
        }
        if (a.beraAmount === 0) return 1;
        if (b.beraAmount === 0) return -1;
        return b.beraAmount - a.beraAmount;
      });
  } catch (error) {
    console.error("Error loading projects:", error);
    return [];
  }
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] py-12">
      <div className="container mx-auto px-4 max-w-6xl flex flex-col min-h-screen">
        <div className="mb-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">
            <a
              href="https://twitter.com/0x_ultra"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--muted))] hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="font-medium">Follow @0x_ultra</span>
            </a>
          </div>

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
        </div>

        {projects.length > 0 ? (
          <ProjectTable projects={projects} />
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
