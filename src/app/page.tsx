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
        // Put unknown allocations (0) at the end
        if (a.beraAmount === 0 && b.beraAmount === 0) return 0;
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
    <main className="min-h-screen bg-yellow-950/5 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-yellow-500">
            Berachain RFA Allocations
          </h1>
          <p className="text-yellow-500/80">
            Explore projects that received BERA token allocations through the
            Request for Allocation program
          </p>
        </div>
        {projects.length > 0 ? (
          <ProjectTable projects={projects} />
        ) : (
          <div className="text-center text-yellow-500">
            No allocation data available at the moment.
          </div>
        )}
      </div>
    </main>
  );
}
