import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import path from "path";
import { promises as fs } from "fs";
import { Project, CsvRecord } from "@/types";

export async function GET() {
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
      return NextResponse.json([]);
    }

    const csvData = await fs.readFile(csvPath, "utf-8");

    if (!csvData.trim()) {
      console.error("CSV file is empty");
      return NextResponse.json([]);
    }

    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relaxColumnCount: true,
    }) as CsvRecord[];

    if (!Array.isArray(records) || records.length === 0) {
      console.error("No valid records found in CSV");
      return NextResponse.json([]);
    }

    const projects = records
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

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error loading projects:", error);
    return NextResponse.json([], { status: 500 });
  }
}
