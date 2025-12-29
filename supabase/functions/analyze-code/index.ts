import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_AI_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { githubData } = await req.json();

    if (!githubData) {
      return new Response(
        JSON.stringify({ error: 'GitHub data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing code for:', githubData.user?.login);

    // Prepare context for AI analysis
    const analysisContext = {
      username: githubData.user?.login,
      name: githubData.user?.name,
      bio: githubData.user?.bio,
      totalRepos: githubData.stats?.totalRepos,
      totalStars: githubData.stats?.totalStars,
      totalContributions: githubData.contributions?.total,
      topLanguages: githubData.languages?.slice(0, 5).map((l: any) => l.name),
      repositories: githubData.repositories?.slice(0, 10).map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stars,
        commitCount: repo.commitCount,
        recentCommits: repo.recentCommits?.slice(0, 5).map((c: any) => c.message),
      })),
    };

    const systemPrompt = `你是一位资深的技术招聘专家和代码审计师。你的任务是分析开发者的 GitHub 数据，生成一份专业、有洞察力的技术画像报告。

分析维度：
1. **技术栈评估**: 基于语言使用情况评估技术广度和深度
2. **工程化能力**: 根据仓库结构、提交信息质量评估
3. **开发风格**: 分析提交模式、代码习惯
4. **项目影响力**: Star 数、Fork 数等社区认可度
5. **成长潜力**: 基于活跃度和学习新技术的迹象

输出要求：
- 使用招聘经理能理解的语言
- 既要专业又要有趣
- 突出亮点，委婉提及改进空间
- 包含具体的数据支撑`;

    const userPrompt = `请分析以下开发者的 GitHub 数据并生成技术画像：

${JSON.stringify(analysisContext, null, 2)}

请返回以下 JSON 格式的分析结果：
{
  "summary": "3-5 句话的整体评价",
  "highlights": ["亮点1", "亮点2", "亮点3"],
  "techProfile": {
    "primaryRole": "主要技术方向（如：全栈工程师/前端专家/后端开发者）",
    "expertise": ["专长领域1", "专长领域2"],
    "style": "编程风格描述"
  },
  "skills": {
    "frontend": 0-100 的评分,
    "backend": 0-100 的评分,
    "devops": 0-100 的评分,
    "algorithms": 0-100 的评分,
    "architecture": 0-100 的评分,
    "documentation": 0-100 的评分
  },
  "insights": [
    "有趣的发现1",
    "有趣的发现2"
  ],
  "recommendations": ["建议1", "建议2"],
  "personality": "基于提交时间和风格推测的开发者性格（如：夜猫子极客/严谨工程师）"
}`;

    // Call Lovable AI with tool calling for structured output
    const response = await fetch(LOVABLE_AI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_tech_profile',
              description: 'Generate a structured technical profile analysis',
              parameters: {
                type: 'object',
                properties: {
                  summary: { type: 'string', description: '3-5 sentences overall evaluation' },
                  highlights: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'Key highlights of the developer'
                  },
                  techProfile: {
                    type: 'object',
                    properties: {
                      primaryRole: { type: 'string' },
                      expertise: { type: 'array', items: { type: 'string' } },
                      style: { type: 'string' }
                    },
                    required: ['primaryRole', 'expertise', 'style']
                  },
                  skills: {
                    type: 'object',
                    properties: {
                      frontend: { type: 'number', minimum: 0, maximum: 100 },
                      backend: { type: 'number', minimum: 0, maximum: 100 },
                      devops: { type: 'number', minimum: 0, maximum: 100 },
                      algorithms: { type: 'number', minimum: 0, maximum: 100 },
                      architecture: { type: 'number', minimum: 0, maximum: 100 },
                      documentation: { type: 'number', minimum: 0, maximum: 100 }
                    },
                    required: ['frontend', 'backend', 'devops', 'algorithms', 'architecture', 'documentation']
                  },
                  insights: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'Interesting findings about the developer'
                  },
                  recommendations: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'Suggestions for improvement'
                  },
                  personality: { type: 'string', description: 'Inferred developer personality' }
                },
                required: ['summary', 'highlights', 'techProfile', 'skills', 'insights', 'recommendations', 'personality']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_tech_profile' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: '请求过于频繁，请稍后再试' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI 配额已用尽，请添加额度' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI analysis failed');
    }

    const aiResponse = await response.json();
    console.log('AI response received');

    // Extract the tool call result
    let analysis;
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      try {
        analysis = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error('Failed to parse tool call arguments:', e);
        // Fallback: try to extract from content
        const content = aiResponse.choices?.[0]?.message?.content;
        if (content) {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
          }
        }
      }
    }

    if (!analysis) {
      // Generate a fallback analysis
      analysis = generateFallbackAnalysis(githubData);
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing code:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze code';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


function generateFallbackAnalysis(githubData: any) {
  const topLang = githubData.languages?.[0]?.name || 'JavaScript';
  const isMoreFrontend = ['TypeScript', 'JavaScript', 'Vue', 'CSS', 'HTML'].includes(topLang);
  
  return {
    summary: `${githubData.user?.name || githubData.user?.login} 是一位活跃的开发者，拥有 ${githubData.stats?.totalRepos || 0} 个公开仓库，主要使用 ${topLang} 进行开发。`,
    highlights: [
      `掌握 ${githubData.languages?.slice(0, 3).map((l: any) => l.name).join('、') || '多种'} 编程语言`,
      `累计获得 ${githubData.stats?.totalStars || 0} 个 Star`,
      `${githubData.contributions?.total || 0} 次贡献记录`
    ],
    techProfile: {
      primaryRole: isMoreFrontend ? '前端开发工程师' : '后端开发工程师',
      expertise: githubData.languages?.slice(0, 3).map((l: any) => l.name) || ['JavaScript'],
      style: '追求代码质量'
    },
    skills: {
      frontend: isMoreFrontend ? 75 : 45,
      backend: isMoreFrontend ? 50 : 70,
      devops: 40,
      algorithms: 55,
      architecture: 50,
      documentation: 45
    },
    insights: [
      `最活跃的项目是 ${githubData.repositories?.[0]?.name || '未知'}`,
      `偏好使用 ${topLang} 技术栈`
    ],
    recommendations: [
      '可以尝试为项目添加更详细的文档',
      '考虑参与更多开源社区贡献'
    ],
    personality: '热爱编程的技术探索者'
  };
}
