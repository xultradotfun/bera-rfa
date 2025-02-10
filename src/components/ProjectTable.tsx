"use client";

import { useState, useEffect, useMemo } from "react";
import { Project } from "@/types";
import { formatBera, getBeraPrice } from "@/lib/utils";
import Image from "next/image";
import { useTwitterProfile } from "@/hooks/useTwitterProfile";
import { ArrowUpDown, Search } from "lucide-react";

interface ProjectRowProps {
  project: Project;
  beraPrice: number;
  overallRank: number;
}

function ProjectRow({ project, beraPrice, overallRank }: ProjectRowProps) {
  const { profileUrl } = useTwitterProfile(project.twitterHandle);
  const dollarValue = project.beraAmount * beraPrice;
  const displayRank = project.beraAmount === 0 ? "-" : overallRank;

  return (
    <tr className="border-b border-[hsl(var(--muted))] transition-colors hover:bg-[hsl(var(--muted))]">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 text-right font-mono text-[hsl(var(--muted-foreground))]">
            {displayRank}
          </div>
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[hsl(var(--muted))] ring-2 ring-[hsl(var(--primary))] ring-offset-2 ring-offset-[hsl(var(--background))]">
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt={`${project.projectName} logo`}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[hsl(var(--primary))] text-sm font-medium">
                {project.projectName.slice(1, 3).toUpperCase()}
              </div>
            )}
          </div>
          <a
            href={`https://twitter.com/${project.twitterHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors"
          >
            {project.projectName}
          </a>
        </div>
      </td>
      <td className="py-4 px-4 text-right font-mono">
        {project.beraAmount === 0 ? (
          <span className="text-[hsl(var(--muted-foreground))]">Unknown</span>
        ) : (
          <span className="text-[hsl(var(--foreground))]">
            {formatBera(project.beraAmount, 2)}
          </span>
        )}
      </td>
      <td className="py-4 px-4 text-right font-mono">
        {project.beraAmount === 0 ? (
          <span className="text-[hsl(var(--muted-foreground))]">Unknown</span>
        ) : (
          <span className="text-[hsl(var(--foreground))]">
            ${formatBera(dollarValue, 2)}
          </span>
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
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate overall rankings once based on BERA amount
  const projectRankings = useMemo(() => {
    const rankMap = new Map<string, number>();
    let currentRank = 1;
    let previousAmount = -1;

    [...projects]
      .filter((p) => p.beraAmount > 0)
      .sort((a, b) => b.beraAmount - a.beraAmount)
      .forEach((project) => {
        // If amount is different from previous, increment rank
        if (project.beraAmount !== previousAmount) {
          currentRank = rankMap.size === 0 ? 1 : currentRank + 1;
        }
        rankMap.set(project.projectName, currentRank);
        previousAmount = project.beraAmount;
      });

    return rankMap;
  }, [projects]);

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

  const filteredProjects = projects.filter((project) =>
    project.projectName
      .toLowerCase()
      .includes(searchQuery.toLowerCase().replace("@", ""))
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;
    if (sortField === "projectName") {
      return multiplier * a.projectName.localeCompare(b.projectName);
    }
    if (sortField === "beraAmount") {
      // For amount sorting, keep known amounts at top/bottom based on direction
      if (a.beraAmount === 0 && b.beraAmount === 0) {
        // If both are unknown, sort by name
        return a.projectName.localeCompare(b.projectName);
      }
      if (a.beraAmount === 0) return 1; // Always put unknown at the end
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
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4 py-2 bg-yellow-950/20 rounded-lg text-sm border border-yellow-900/20">
        <span className="text-yellow-500/70">
          &ldquo;Unknown&rdquo; indicates unconfirmed allocation
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-500/70">BERA</span>
          <span className="font-mono font-medium text-yellow-500">
            ${formatBera(beraPrice, 2)}
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
        </div>
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-[hsl(var(--muted))] border border-[hsl(var(--primary))] rounded-lg text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--background))] transition-all"
        />
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
            {sortedProjects.map((project) => (
              <ProjectRow
                key={project.projectName}
                project={project}
                beraPrice={beraPrice}
                overallRank={projectRankings.get(project.projectName) || 0}
              />
            ))}
          </tbody>
        </table>
        {sortedProjects.length === 0 && (
          <div className="text-center py-8 text-yellow-500/70">
            No projects found matching &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
