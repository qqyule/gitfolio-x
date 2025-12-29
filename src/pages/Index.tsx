import StarField from "@/components/StarField";
import GalaxyOrb from "@/components/GalaxyOrb";
import GitHubInput from "@/components/GitHubInput";
import FeatureCard from "@/components/FeatureCard";
import { Globe, Brain, FileCode, Zap, Shield, Palette } from "lucide-react";
import galaxyHero from "@/assets/galaxy-hero.jpg";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <div 
        className="fixed inset-0 z-0 opacity-40"
        style={{
          backgroundImage: `url(${galaxyHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(2px)",
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
      <StarField />

      {/* Main content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 opacity-0 animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Powered by AI & React 19 RSC
              </span>
            </div>

            {/* Main title */}
            <h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 opacity-0 animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              <span className="text-gradient-cosmic">GitFolio</span>
              <span className="text-foreground"> X</span>
            </h1>

            {/* Subtitle */}
            <p 
              className="text-xl md:text-2xl text-muted-foreground mb-4 opacity-0 animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              生成式代码宇宙
            </p>
            <p 
              className="text-lg text-muted-foreground/80 mb-12 max-w-2xl mx-auto opacity-0 animate-fade-in"
              style={{ animationDelay: "400ms" }}
            >
              将您的 GitHub 仓库转化为震撼的 3D 可视化简历，
              <br className="hidden md:block" />
              让 AI 挖掘代码背后的技术实力。
            </p>

            {/* Galaxy Orb Animation */}
            <div 
              className="mb-12 opacity-0 animate-fade-in"
              style={{ animationDelay: "500ms" }}
            >
              <GalaxyOrb />
            </div>

            {/* GitHub Input */}
            <div 
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: "600ms" }}
            >
              <GitHubInput />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-24 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-foreground">核心功能</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                前沿技术架构，让您的代码简历脱颖而出
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Globe className="w-7 h-7" />}
                title="3D 代码星系"
                description="每个仓库是一颗星球，每次提交是环绕的粒子。用 WebGL/WebGPU 渲染数万节点，60FPS 流畅体验。"
                delay={100}
              />
              <FeatureCard
                icon={<Brain className="w-7 h-7" />}
                title="AI 技能猎头"
                description="智能分析代码质量、工程化程度和编程风格，生成自然语言技术画像和能力雷达图。"
                delay={200}
              />
              <FeatureCard
                icon={<FileCode className="w-7 h-7" />}
                title="生成式简历"
                description="根据代码风格动态调整 UI：后端向展示终端风格，前端向展示玻璃拟态。千人千面。"
                delay={300}
              />
              <FeatureCard
                icon={<Zap className="w-7 h-7" />}
                title="极速加载"
                description="React Server Components + Streaming 技术，服务端渲染 + 流式传输，首屏加载极快。"
                delay={400}
              />
              <FeatureCard
                icon={<Shield className="w-7 h-7" />}
                title="隐私优先"
                description="无需 OAuth 授权即可分析公开仓库，降低使用门槛，保护您的账号安全。"
                delay={500}
              />
              <FeatureCard
                icon={<Palette className="w-7 h-7" />}
                title="一键导出"
                description="支持导出为精美 PDF 或直接部署为独立站点，打造专属个人品牌。"
                delay={600}
              />
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="relative py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              <span className="text-foreground">技术架构</span>
            </h2>
            
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {[
                "React 19",
                "Next.js 15",
                "React Three Fiber",
                "WebGPU",
                "GraphQL",
                "Vercel AI SDK",
                "Tailwind CSS",
                "TypeScript",
              ].map((tech, i) => (
                <span
                  key={tech}
                  className="px-4 py-2 rounded-full glass-card text-sm text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300 cursor-default opacity-0 animate-fade-in"
                  style={{ animationDelay: `${i * 100 + 100}ms` }}
                >
                  {tech}
                </span>
              ))}
            </div>

            <p className="text-muted-foreground/80 max-w-2xl mx-auto">
              使用 2025 年最前沿的全栈技术，展示您对现代 React 架构、
              3D 图形渲染和 AI Native 开发模式的深刻理解。
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-12 px-4 border-t border-border/30">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-muted-foreground text-sm">
              <span className="text-gradient-cosmic font-semibold">GitFolio X</span>
              {" "}— 让代码讲述您的故事
            </p>
            <p className="text-muted-foreground/60 text-xs mt-2">
              © 2025 Code Galaxy Project. Built with ❤️
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
