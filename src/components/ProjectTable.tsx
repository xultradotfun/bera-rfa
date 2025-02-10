"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types";
import { formatBera, getBeraPrice } from "@/lib/utils";
import Image from "next/image";
import { useTwitterProfile } from "@/hooks/useTwitterProfile";
import { ArrowUpDown } from "lucide-react";

interface ProjectRowProps {
  project: Project;
  beraPrice: number;
  rank: number;
}

function ProjectRow({ project, beraPrice, rank }: ProjectRowProps) {
  const { profileUrl } = useTwitterProfile(project.twitterHandle);
  const dollarValue = project.beraAmount * beraPrice;
  const displayRank = project.beraAmount === 0 ? "-" : rank;

  return (
    <tr className="border-b border-yellow-900/20 hover:bg-yellow-950/20 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 text-right font-mono text-yellow-500/70">
            {displayRank}
          </div>
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-yellow-900/20">
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt={`${project.projectName} logo`}
                fill
                className="object-cover"
                sizes="32px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-yellow-500 text-sm">
                {project.projectName.slice(1, 3).toUpperCase()}
              </div>
            )}
          </div>
          <a
            href={`https://twitter.com/${project.twitterHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-yellow-500"
          >
            {project.projectName}
          </a>
        </div>
      </td>
      <td className="py-4 px-4 text-right font-mono text-yellow-500">
        {project.beraAmount === 0 ? (
          <span className="text-yellow-500/50">Unknown</span>
        ) : (
          formatBera(project.beraAmount, 2)
        )}
      </td>
      <td className="py-4 px-4 text-right font-mono text-yellow-500">
        {project.beraAmount === 0 ? (
          <span className="text-yellow-500/50">Unknown</span>
        ) : (
          `$${formatBera(dollarValue, 2)}`
        )}
      </td>
    </tr>
  );
}

type SortField = "projectName" | "beraAmount";
type SortDirection = "asc" | "desc";

interface ProjectTableProps {
  projects: Project[];
}

export function ProjectTable({ projects }: ProjectTableProps) {
  const [sortField, setSortField] = useState<SortField>("beraAmount");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [beraPrice, setBeraPrice] = useState<number>(0);

  useEffect(() => {
    const fetchPrice = async () => {
      const price = await getBeraPrice();
      setBeraPrice(price);
    };

    fetchPrice();
    // Refresh price every minute
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  const sortedProjects = [...projects].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;
    if (sortField === "projectName") {
      return multiplier * a.projectName.localeCompare(b.projectName);
    }
    // Put unknown allocations (0) at the end when sorting by amount
    if (sortField === "beraAmount") {
      if (a.beraAmount === 0 && b.beraAmount === 0) return 0;
      if (a.beraAmount === 0) return 1;
      if (b.beraAmount === 0) return -1;
      return multiplier * (a.beraAmount - b.beraAmount);
    }
    return 0;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="text-yellow-500">
          Current BERA Price:{" "}
          <span className="font-mono">${formatBera(beraPrice, 2)}</span>
        </div>
        <div className="text-yellow-500/70 text-sm">
          Note: &ldquo;Unknown&rdquo; means the allocation amount is not yet
          confirmed
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-yellow-900/20 bg-yellow-950/10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-yellow-900/20 bg-yellow-950/20">
              <th className="py-3 px-4 text-left">
                <button
                  onClick={() => toggleSort("projectName")}
                  className="flex items-center gap-2 hover:text-yellow-400 text-yellow-500 ml-11"
                >
                  Project
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => toggleSort("beraAmount")}
                  className="flex items-center gap-2 hover:text-yellow-400 text-yellow-500 ml-auto"
                >
                  BERA Amount
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="py-3 px-4 text-right text-yellow-500">
                USD Value
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects.map((project, index) => (
              <ProjectRow
                key={project.projectName}
                project={project}
                beraPrice={beraPrice}
                rank={index + 1}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
