import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Sparkles, MapPin, Building, Calendar, Users, Star, GitFork, GitCommit, GitPullRequest, Hash, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import StarField from "@/components/StarField";
import SkillsRadar from "@/components/SkillsRadar";
import LanguageChart from "@/components/LanguageChart";
import RepoCard from "@/components/RepoCard";
import { fetchGitHubData, analyzeCode } from "@/lib/github";
import type { GitHubData, AIAnalysis } from "@/types/github";
import galaxyHero from "@/assets/galaxy-hero.jpg";

type AnalysisStage = 
  | "fetching" 
  | "analyzing" 
  | "complete" 
  | "error";

const Profile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const username = searchParams.get("user") || "";

  const [stage, setStage] = useState<AnalysisStage>("fetching");
  const [statusMessage, setStatusMessage] = useState("正在连接 GitHub API...");
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  const handleShareToX = () => {
    const shareUrl = window.location.href;
    const displayName = githubData?.user?.name || username;
    const shareText = `我刚刚用 AI 分析了 ${displayName} 的 GitHub 代码宇宙！来看看这份技术画像 🚀`;
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    
    window.open(xUrl, "_blank", "width=700,height=500");
    toast.success("正在打开 X 分享页面...");
  };

  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }

    const analyze = async () => {
      try {
        // Stage 1: Fetch GitHub data
        setStage("fetching");
        const stages = [
          "正在连接 GitHub API...",
          "正在获取仓库信息...",
          "正在解析代码结构...",
        ];
        
        for (const msg of stages) {
          setStatusMessage(msg);
          await new Promise(r => setTimeout(r, 600));
        }

        const data = await fetchGitHubData(username);
        setGithubData(data);

        // Stage 2: AI Analysis
        setStage("analyzing");
        const aiStages = [
          "AI 正在阅读您的代码...",
          "正在分析技术栈和编程风格...",
          "正在生成技术画像...",
        ];

        for (const msg of aiStages) {
          setStatusMessage(msg);
          await new Promise(r => setTimeout(r, 800));
        }

        const result = await analyzeCode(data);
        setAnalysis(result);
        setStage("complete");
        toast.success("分析完成！");

      } catch (error) {
        console.error("Analysis error:", error);
        setStage("error");
        toast.error(error instanceof Error ? error.message : "分析失败");
      }
    };

    analyze();
  }, [username, navigate]);

  if (!username) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `url(${galaxyHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(4px)",
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background/80 via-background/95 to-background" />
      <StarField />

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8 opacity-0 animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>

        {/* Loading state */}
        {stage !== "complete" && stage !== "error" && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary opacity-20 animate-ping" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary to-secondary opacity-40 animate-pulse" />
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
              </div>
            </div>
            <p className="text-xl text-foreground font-medium mb-2">
              分析 @{username} 的代码宇宙
            </p>
            <p className="text-muted-foreground animate-pulse">
              {statusMessage}
            </p>
          </div>
        )}

        {/* Error state */}
        {stage === "error" && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="glass-card rounded-2xl p-8 text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">😔</span>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">分析失败</h2>
              <p className="text-muted-foreground mb-6">
                无法获取 @{username} 的 GitHub 数据，请检查用户名是否正确。
              </p>
              <Button variant="cosmic" onClick={() => navigate("/")}>
                返回重试
              </Button>
            </div>
          </div>
        )}

        {/* Complete state */}
        {stage === "complete" && githubData && analysis && (
          <div className="space-y-8 relative">
            {/* Share button - top right */}
            <div className="absolute right-0 -top-2 z-20">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShareToX}
                      className="gap-2 bg-card/80 backdrop-blur-sm border-primary/30 hover:bg-primary/10 hover:border-primary"
                    >
                      <Share2 className="w-4 h-4" />
                      分享到 𝕏
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[200px]">
                    <p>分享此技术画像到 X</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {/* User header */}
            <header className="glass-card rounded-3xl p-8 opacity-0 animate-slide-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {/* Avatar */}
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-br from-primary to-secondary rounded-full opacity-50 blur-lg" />
                  <img
                    src={githubData.user.avatarUrl}
                    alt={githubData.user.name || githubData.user.login}
                    className="relative w-28 h-28 rounded-full border-4 border-card"
                  />
                </div>

                {/* User info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-foreground mb-1">
                    {githubData.user.name || githubData.user.login}
                  </h1>
                  <p className="text-primary text-lg mb-3">@{githubData.user.login}</p>
                  
                  {githubData.user.bio && (
                    <p className="text-muted-foreground mb-4 max-w-xl">{githubData.user.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground">
                    {githubData.user.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {githubData.user.location}
                      </span>
                    )}
                    {githubData.user.company && (
                      <span className="flex items-center gap-1">
                        <Building className="w-4 h-4" /> {githubData.user.company}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> 加入于 {new Date(githubData.user.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {githubData.user.followers} 关注者
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{githubData.stats.totalRepos}</div>
                    <div className="text-sm text-muted-foreground">仓库</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 text-star-bright" /> {githubData.stats.totalStars}
                    </div>
                    <div className="text-sm text-muted-foreground">Star</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                      <GitFork className="w-5 h-5" /> {githubData.stats.totalForks}
                    </div>
                    <div className="text-sm text-muted-foreground">Fork</div>
                  </div>
                </div>
              </div>
            </header>

            {/* AI Analysis Section */}
            <section className="glass-card rounded-3xl p-8 opacity-0 animate-slide-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">AI 技术画像</h2>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left: Summary and profile */}
                <div className="space-y-6">
                  {/* Role badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
                    <span className="text-primary font-semibold">{analysis.techProfile.primaryRole}</span>
                  </div>

                  {/* Summary */}
                  <p className="text-lg text-foreground leading-relaxed">
                    {analysis.summary}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">✨ 核心亮点</h3>
                    <ul className="space-y-2">
                      {analysis.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Personality */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">开发者性格</p>
                    <p className="text-foreground font-medium">{analysis.personality}</p>
                  </div>

                  {/* Insights */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">🔍 有趣发现</h3>
                    <ul className="space-y-2">
                      {analysis.insights.map((insight, i) => (
                        <li key={i} className="text-muted-foreground">{insight}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Skills radar */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4">能力雷达</h3>
                  <SkillsRadar skills={analysis.skills} />
                  
                  {/* Expertise tags */}
                  <div className="mt-6">
                    <h4 className="text-sm text-muted-foreground mb-2">专长领域</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.techProfile.expertise.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 rounded-full text-sm bg-secondary/20 text-secondary-foreground border border-secondary/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Languages and repos section */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Language stats */}
              <section className="glass-card rounded-3xl p-6 opacity-0 animate-slide-up" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
                <h2 className="text-xl font-bold text-foreground mb-4">技术栈分布</h2>
                <LanguageChart languages={githubData.languages} />
              </section>

              {/* Contribution stats */}
              <section className="glass-card rounded-3xl p-6 lg:col-span-2 opacity-0 animate-slide-up" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
                <h2 className="text-xl font-bold text-foreground mb-4">贡献统计</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <GitCommit className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{githubData.contributions.total}</div>
                    <div className="text-sm text-muted-foreground">总贡献</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <Hash className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{githubData.contributions.commits}</div>
                    <div className="text-sm text-muted-foreground">Commits</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/30">
                    <GitPullRequest className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{githubData.contributions.pullRequests}</div>
                    <div className="text-sm text-muted-foreground">PRs</div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-3">💡 成长建议</h3>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-secondary mt-1">→</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>

            {/* Repositories */}
            <section className="opacity-0 animate-slide-up" style={{ animationDelay: "500ms", animationFillMode: "forwards" }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">代码星系</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {githubData.repositories.slice(0, 6).map((repo, index) => (
                  <RepoCard key={repo.name} repo={repo} index={index} />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
