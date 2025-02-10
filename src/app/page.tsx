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
      <div className="container mx-auto px-4 max-w-6xl">
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
            Request for Allocation program
          </p>
        </div>

        {projects.length > 0 ? (
          <ProjectTable projects={projects} />
        ) : (
          <div className="text-center text-[hsl(var(--muted-foreground))] p-12 bg-[hsl(var(--muted))] rounded-lg">
            No allocation data available at the moment.
          </div>
        )}
      </div>
    </main>
  );
}
