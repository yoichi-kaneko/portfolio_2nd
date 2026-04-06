"use client";

import { useGitHubContributions } from "@/hooks/useGitHubContributions";
import { GitHubContributionChart } from "./GitHubContributionChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCodeBranch } from "@fortawesome/free-solid-svg-icons";

function GitHubCardSkeleton() {
  return (
    <div
      className="text-center animate-pulse w-full"
      data-testid="github-card-skeleton"
    >
      <div className="h-2 w-32 bg-gray-800 rounded mx-auto mb-3" />
      <div className="h-12 bg-gray-800 rounded" />
      <div className="h-2 w-20 bg-gray-800 rounded mx-auto mt-3" />
    </div>
  );
}

export function GitHubCard() {
  const { data, loading } = useGitHubContributions();

  if (loading) {
    return <GitHubCardSkeleton />;
  }

  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest">
        <FontAwesomeIcon icon={faCodeBranch} className="w-4 h-4 mr-1" />
        GitHub Contributions
      </p>
      {data ? (
        <GitHubContributionChart data={data} />
      ) : (
        <p className="text-xs text-gray-600 h-12 flex items-center justify-center">
          No Data
        </p>
      )}
      <p className="text-xs mt-3 text-gray-400">yoichi-kaneko</p>
    </div>
  );
}
