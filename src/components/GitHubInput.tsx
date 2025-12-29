import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const GitHubInput = () => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("请输入 GitHub 用户名");
      return;
    }

    setIsLoading(true);
    
    // Navigate to profile page with username
    setTimeout(() => {
      navigate(`/profile?user=${encodeURIComponent(username.trim())}`);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="relative group">
        {/* Glow background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
        
        {/* Input container */}
        <div className="relative flex gap-2 p-2 rounded-2xl glass-card">
          <div className="relative flex-1">
            <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="输入您的 GitHub 用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              cosmic
              className="pl-12 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isLoading}
            />
          </div>
          
          <Button
            type="submit"
            variant="cosmic"
            size="lg"
            disabled={isLoading}
            className="relative overflow-hidden min-w-[140px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-spin" />
                分析中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                生成宇宙
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </div>
      </div>
      
      {/* Scanning animation */}
      {isAnalyzing && (
        <div className="mt-6 relative h-2 rounded-full overflow-hidden bg-muted">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent animate-scanning" />
        </div>
      )}
      
      {/* Example users */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <span className="text-muted-foreground text-sm">试试看:</span>
        {["torvalds", "gaearon", "yyx990803"].map((user) => (
          <button
            key={user}
            type="button"
            onClick={() => setUsername(user)}
            className="text-sm text-primary/70 hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            @{user}
          </button>
        ))}
      </div>
    </form>
  );
};

export default GitHubInput;
