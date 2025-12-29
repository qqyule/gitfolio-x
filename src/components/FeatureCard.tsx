import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  delay?: number;
}

const FeatureCard = ({ icon, title, description, className, delay = 0 }: FeatureCardProps) => {
  return (
    <div
      className={cn(
        "group relative glass-card rounded-2xl p-6 transition-all duration-500 hover:scale-105 hover:bg-card/60",
        "opacity-0 animate-slide-up",
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 glow-primary pointer-events-none" />
      
      {/* Icon container */}
      <div className="relative z-10 mb-4 w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-300">
        <div className="text-primary group-hover:text-accent transition-colors duration-300">
          {icon}
        </div>
      </div>
      
      {/* Content */}
      <h3 className="relative z-10 text-xl font-semibold text-foreground mb-2 group-hover:text-gradient-cosmic transition-all duration-300">
        {title}
      </h3>
      <p className="relative z-10 text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse" />
        <div className="absolute top-4 right-8 w-1 h-1 rounded-full bg-secondary" />
        <div className="absolute top-8 right-4 w-1 h-1 rounded-full bg-accent" />
      </div>
    </div>
  );
};

export default FeatureCard;
