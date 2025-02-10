"use client";

import Image from "next/image";
import { Project } from "@/types";
import { formatBera, cn } from "@/lib/utils";
import { useTwitterProfile } from "@/hooks/useTwitterProfile";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { profileUrl, isLoading } = useTwitterProfile(project.twitterHandle);

  return (
    <div className="flex items-center gap-4 rounded-lg bg-yellow-950/20 p-4 hover:bg-yellow-950/30 transition-colors">
      <div
        className={cn(
          "relative h-12 w-12 overflow-hidden rounded-full bg-yellow-900/20",
          isLoading && "animate-pulse"
        )}
      >
        {!isLoading && profileUrl ? (
          <Image
            src={profileUrl}
            alt={`${project.projectName} logo`}
            fill
            className="object-cover transition-opacity duration-200"
            sizes="48px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-yellow-500">
            {project.projectName.slice(1, 3).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-yellow-500">
          <a
            href={`https://twitter.com/${project.twitterHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {project.projectName}
          </a>
        </h3>
        <p className="text-sm text-yellow-500/80">
          {formatBera(project.beraAmount)} BERA
        </p>
      </div>
    </div>
  );
}
