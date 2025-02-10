import { ProjectList } from "@/components/ProjectList";
import { parse } from "csv-parse/sync";
import path from "path";
import { promises as fs } from "fs";
import { Project, CsvRecord } from "@/types";

async function getProjects(): Promise<Project[]> {
  const csvPath = path.join(
    process.cwd(),
    "public",
    "data",
    "rfa_allocations.csv"
  );
  const csvData = await fs.readFile(csvPath, "utf-8");

  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
  }) as CsvRecord[];

  return records
    .filter((record) => parseFloat(record.bera_amount) > 0)
    .map((record) => ({
      projectName: record.project_name,
      beraAmount: parseFloat(record.bera_amount),
      twitterHandle: record.project_name.replace("@", ""),
    }))
    .sort((a: Project, b: Project) => b.beraAmount - a.beraAmount);
}

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-yellow-950/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-yellow-500">
            Berachain RFA Allocations
          </h1>
          <p className="text-yellow-500/80">
            Explore projects that received BERA token allocations through the
            Request for Allocation program
          </p>
        </div>
        <ProjectList projects={projects} />
      </div>
    </main>
  );
}
