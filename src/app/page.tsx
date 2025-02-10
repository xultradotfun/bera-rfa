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
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
            Berachain RFA Allocations
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-lg max-w-2xl mx-auto">
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
