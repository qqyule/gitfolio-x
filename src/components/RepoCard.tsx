import type { Repository } from "@/types/github";
import { Star, GitFork, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface RepoCardProps {
  repo: Repository;
  index: number;
}

const RepoCard = ({ repo, index }: RepoCardProps) => {
  // Calculate "planet" size based on stars and commits
  const importance = Math.min(repo.stars * 2 + repo.commitCount * 0.1, 100);
  const size = 60 + (importance / 100) * 40;

  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative glass-card rounded-2xl p-5 transition-all duration-500",
        "hover:scale-[1.03] hover:bg-card/60 opacity-0 animate-slide-up hover-glow"
      )}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
    >
      {/* Glow effect */}
      <div 
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${repo.languageColor || 'hsl(185 80% 55%)'}40, transparent)`,
        }}
      />

      {/* Planet indicator */}
      <div className="absolute -right-3 -top-3 opacity-30 group-hover:opacity-60 transition-opacity">
        <div
          className="rounded-full animate-pulse-glow"
          style={{
            width: size / 2,
            height: size / 2,
            backgroundColor: repo.languageColor || 'hsl(185 80% 55%)',
            boxShadow: `0 0 20px ${repo.languageColor || 'hsl(185 80% 55%)'}`,
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[80%]">
            {repo.name}
          </h3>
          <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[40px]">
          {repo.description || "暂无描述"}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          {repo.language && (
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: repo.languageColor || '#8b949e' }}
              />
              <span className="text-muted-foreground">{repo.language}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="w-4 h-4" />
            <span>{repo.stars}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <GitFork className="w-4 h-4" />
            <span>{repo.forks}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

export default RepoCard;
