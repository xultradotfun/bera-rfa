import { useMemo } from "react";
import { Project } from "@/types";
import { formatBera } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTwitterProfile } from "@/hooks/useTwitterProfile";
import Image from "next/image";

interface AnalyticsProps {
  projects: Project[];
  beraPrice: number;
}

interface PieChartData {
  name: string;
  value: number;
  percentage: number;
}

interface TopProjectRowProps {
  name: string;
  amount: number;
  percentage: number;
  twitterHandle: string;
}

function TopProjectRow({
  name,
  amount,
  percentage,
  twitterHandle,
}: TopProjectRowProps) {
  const { profileUrl } = useTwitterProfile(twitterHandle);

  return (
    <div className="group hover:bg-[hsl(var(--muted-foreground))] hover:bg-opacity-5 rounded-md transition-colors">
      <div className="flex items-center justify-between px-2 py-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-[hsl(var(--muted))] ring-1 ring-[hsl(var(--primary))] ring-offset-1 ring-offset-[hsl(var(--background))]">
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt={`${name} logo`}
                fill
                className="object-cover"
                sizes="20px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[hsl(var(--primary))] text-[10px] font-medium">
                {name.slice(1, 3).toUpperCase()}
              </div>
            )}
          </div>
          <a
            href={`https://twitter.com/${twitterHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate hover:text-[hsl(var(--primary))] transition-colors text-sm"
          >
            {name}
          </a>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono text-[hsl(var(--muted-foreground))]">
            {percentage.toFixed(1)}%
          </span>
          <span className="font-mono w-24 text-right">
            {formatBera(amount)}
          </span>
        </div>
      </div>
      <div className="h-1 bg-[hsl(var(--muted-foreground))] bg-opacity-10 rounded-full overflow-hidden mx-2 mt-0.5 mb-1">
        <div
          className="h-full bg-[hsl(var(--primary))] rounded-full transition-all group-hover:bg-opacity-80"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: PieChartData;
  }>;
  projects: Project[];
}

function CustomTooltip({ active, payload, projects }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  if (data.name === "Others") {
    // Get all projects not in top 10
    const top10Projects = projects
      .filter((p) => p.beraAmount > 0)
      .sort((a, b) => b.beraAmount - a.beraAmount)
      .slice(0, 10)
      .map((p) => p.projectName);

    const otherProjects = projects
      .filter((p) => p.beraAmount > 0 && !top10Projects.includes(p.projectName))
      .sort((a, b) => b.beraAmount - a.beraAmount);

    const top10OtherProjects = otherProjects.slice(0, 10);
    const remainingCount = otherProjects.length - 10;
    const totalOthersAmount = otherProjects.reduce(
      (sum, p) => sum + p.beraAmount,
      0
    );

    return (
      <div className="bg-[hsl(var(--muted))] border border-[hsl(var(--primary))] rounded-lg p-3 shadow-md min-w-[240px]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Others Summary</span>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {otherProjects.length} projects
          </span>
        </div>
        <div className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
          Total: {formatBera(totalOthersAmount)} BERA
        </div>
        <div className="space-y-1.5">
          {top10OtherProjects.map((project) => (
            <div
              key={project.projectName}
              className="flex items-center justify-between text-sm hover:bg-[hsl(var(--muted-foreground))] hover:bg-opacity-5 rounded px-1"
            >
              <a
                href={`https://twitter.com/${project.twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[hsl(var(--primary))] transition-colors"
              >
                {project.projectName}
              </a>
              <span className="font-mono text-xs">
                {formatBera(project.beraAmount)}
              </span>
            </div>
          ))}
        </div>
        {remainingCount > 0 && (
          <div className="mt-2 pt-2 border-t border-[hsl(var(--muted-foreground))] border-opacity-20 text-xs text-[hsl(var(--muted-foreground))] text-center">
            and {remainingCount} more projects...
          </div>
        )}
      </div>
    );
  }

  const project = projects.find((p) => p.projectName === data.name);
  if (!project) return null;

  return (
    <div className="bg-[hsl(var(--muted))] border border-[hsl(var(--primary))] rounded-lg p-3 shadow-md">
      <div className="flex items-center gap-2 mb-2">
        <ProjectAvatar
          name={project.projectName}
          twitterHandle={project.twitterHandle}
          size={5}
        />
        <a
          href={`https://twitter.com/${project.twitterHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:text-[hsl(var(--primary))] transition-colors"
        >
          {project.projectName}
        </a>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-[hsl(var(--muted-foreground))]">
            Allocation:
          </span>
          <span className="font-mono">
            {formatBera(project.beraAmount)} BERA
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[hsl(var(--muted-foreground))]">Share:</span>
          <span>{data.percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

// Add a reusable ProjectAvatar component
function ProjectAvatar({
  name,
  twitterHandle,
  size = 6,
}: {
  name: string;
  twitterHandle: string;
  size?: number;
}) {
  const { profileUrl } = useTwitterProfile(twitterHandle);

  return (
    <div
      className={`relative h-${size} w-${size} overflow-hidden rounded-full bg-[hsl(var(--muted))] ring-1 ring-[hsl(var(--primary))] ring-offset-1 ring-offset-[hsl(var(--background))]`}
    >
      {profileUrl ? (
        <Image
          src={profileUrl}
          alt={`${name} logo`}
          fill
          className="object-cover"
          sizes={`${size * 4}px`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[hsl(var(--primary))] text-xs font-medium">
          {name.slice(1, 3).toUpperCase()}
        </div>
      )}
    </div>
  );
}

export function Analytics({ projects, beraPrice }: AnalyticsProps) {
  const stats = useMemo(() => {
    const totalAllocation = projects.reduce((sum, p) => sum + p.beraAmount, 0);
    const knownProjects = projects.filter((p) => p.beraAmount > 0);
    const unknownProjects = projects.filter((p) => p.beraAmount === 0);

    // Calculate allocation tiers
    const tiers = {
      large: knownProjects.filter((p) => p.beraAmount >= 100000).length,
      medium: knownProjects.filter(
        (p) => p.beraAmount >= 50000 && p.beraAmount < 100000
      ).length,
      small: knownProjects.filter(
        (p) => p.beraAmount > 0 && p.beraAmount < 50000
      ).length,
    };

    // Calculate percentages for the pie chart
    const pieData = knownProjects
      .sort((a, b) => b.beraAmount - a.beraAmount)
      .map((project) => ({
        name: project.projectName,
        value: project.beraAmount,
        percentage: (project.beraAmount / totalAllocation) * 100,
      }));

    return {
      totalAllocation,
      averageAllocation: totalAllocation / knownProjects.length,
      knownProjectsCount: knownProjects.length,
      unknownProjectsCount: unknownProjects.length,
      tiers,
      pieData,
      top10Projects: knownProjects.slice(0, 10).map((project) => ({
        name: project.projectName,
        amount: project.beraAmount,
        percentage: (project.beraAmount / totalAllocation) * 100,
      })),
    };
  }, [projects]);

  const COLORS = [
    "#FFB000", // Primary gold
    "#FFCB45", // Lighter gold
    "#FFD56A", // Even lighter gold
    "#FFE08F", // Very light gold
    "#FFEAB4", // Pale gold
    "#FFD700", // Classic gold
    "#FFC700", // Rich gold
    "#FFB700", // Deep gold
    "#FFA700", // Orange gold
    "#FF9700", // Amber
    "#FFE5B4", // Peach
    "#FFD700", // Yellow gold
    "#FFC125", // Golden yellow
    "#FFB90F", // Dark goldenrod
    "#FFA500", // Orange
    "#FF9912", // Dark orange
    "#FF8C00", // Dark amber
    "#FF7F24", // Chocolate
    "#FF7518", // Pumpkin
    "#FF6700", // Safety orange
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[hsl(var(--muted))] p-6 rounded-lg">
          <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Total BERA Allocated
          </h3>
          <p className="mt-2 text-3xl font-bold text-[hsl(var(--foreground))]">
            {formatBera(stats.totalAllocation)}
          </p>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Across {stats.knownProjectsCount} projects
          </p>
        </div>
        <div className="bg-[hsl(var(--muted))] p-6 rounded-lg">
          <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Average Allocation
          </h3>
          <div className="mt-2">
            <p className="text-3xl font-bold text-[hsl(var(--foreground))]">
              {formatBera(stats.averageAllocation)}
              <span className="ml-2 text-lg font-normal text-[hsl(var(--muted-foreground))]">
                (${formatBera(stats.averageAllocation * beraPrice)})
              </span>
            </p>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              BERA per project
            </p>
          </div>
        </div>
        <div className="bg-[hsl(var(--muted))] p-6 rounded-lg">
          <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Large Allocations
          </h3>
          <p className="mt-2 text-2xl font-bold text-[hsl(var(--foreground))]">
            {stats.tiers.large} Projects
          </p>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            ≥100k BERA
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[hsl(var(--muted))] p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-6">
            Distribution of Allocations
          </h3>
          <div className="h-[400px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={140}
                  innerRadius={70}
                  dataKey="value"
                  labelLine={false}
                  label={false}
                  paddingAngle={0.5}
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                      strokeWidth={1}
                      stroke="hsl(var(--background))"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomTooltip projects={projects} />}
                  wrapperStyle={{ outline: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 max-h-[120px] overflow-y-auto space-y-1 pr-2">
            {stats.pieData.slice(0, 15).map((entry, index) => (
              <div
                key={entry.name}
                className="flex items-center justify-between text-xs hover:bg-[hsl(var(--muted-foreground))] hover:bg-opacity-5 rounded px-1.5 py-0.5"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <a
                    href={`https://twitter.com/${entry.name.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[hsl(var(--primary))] transition-colors"
                  >
                    {entry.name}
                  </a>
                </div>
                <span className="font-mono text-[hsl(var(--muted-foreground))]">
                  {entry.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
            {stats.pieData.length > 15 && (
              <div className="text-center text-xs text-[hsl(var(--muted-foreground))] pt-1 border-t border-[hsl(var(--muted-foreground))] border-opacity-20">
                and {stats.pieData.length - 15} more projects...
              </div>
            )}
          </div>
        </div>

        <div className="bg-[hsl(var(--muted))] p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-3">Top 10 Allocations</h3>
          <div className="space-y-1">
            {stats.top10Projects.map((item) => (
              <TopProjectRow
                key={item.name}
                name={item.name}
                amount={item.amount}
                percentage={item.percentage}
                twitterHandle={item.name.replace("@", "")}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[hsl(var(--muted))] p-6 rounded-lg">
          <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Medium Allocations
          </h3>
          <p className="mt-2 text-2xl font-bold text-[hsl(var(--foreground))]">
            {stats.tiers.medium} Projects
          </p>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            50k-100k BERA
          </p>
        </div>
        <div className="bg-[hsl(var(--muted))] p-6 rounded-lg">
          <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Small Allocations
          </h3>
          <p className="mt-2 text-2xl font-bold text-[hsl(var(--foreground))]">
            {stats.tiers.small} Projects
          </p>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {"<"}50k BERA
          </p>
        </div>
        <div className="bg-[hsl(var(--muted))] p-6 rounded-lg">
          <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Pending Confirmation
          </h3>
          <p className="mt-2 text-2xl font-bold text-[hsl(var(--foreground))]">
            {stats.unknownProjectsCount} Projects
          </p>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Unconfirmed allocations
          </p>
        </div>
      </div>
    </div>
  );
}
