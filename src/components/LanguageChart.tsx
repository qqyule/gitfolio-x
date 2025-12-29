import type { Language } from "@/types/github";

interface LanguageChartProps {
  languages: Language[];
}

const LanguageChart = ({ languages }: LanguageChartProps) => {
  const totalBytes = languages.reduce((sum, lang) => sum + lang.bytes, 0);
  
  // Take top 6 languages
  const topLanguages = languages.slice(0, 6);
  
  return (
    <div className="space-y-4">
      {/* Bar chart */}
      <div className="space-y-3">
        {topLanguages.map((lang, index) => {
          const percentage = totalBytes > 0 ? (lang.bytes / totalBytes) * 100 : 0;
          
          return (
            <div key={lang.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-foreground font-medium">{lang.name}</span>
                <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: lang.color,
                    animationDelay: `${index * 100}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Language dots */}
      <div className="flex flex-wrap gap-3 pt-2">
        {topLanguages.map((lang) => (
          <div key={lang.name} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: lang.color }}
            />
            <span className="text-xs text-muted-foreground">{lang.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageChart;
