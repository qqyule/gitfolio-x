# GitHub App 认证迁移方案

## 当前问题

当前使用 Personal Access Token (PAT) 存在以下风险：

1. **权限过大**：PAT 需要 `repo` 权限才能访问私有仓库
2. **泄露风险**：PAT 泄露后攻击者可以获得完整访问权限
3. **难以管理**：无法限制 Token 的使用范围
4. **无独立 Rate Limit**：与用户其他请求共享配额

## 推荐方案：GitHub App

### 优势

| 特性 | PAT | GitHub App |
|------|-----|------------|
| Rate Limit | 5000/hr (用户) | 5000/hr (独立) |
| 权限控制 | 粗粒度 | 细粒度 |
| Token 管理 | 手动撤销 | 自动过期 |
| 安装范围 | 用户级别 | 组织/用户级别 |
| Webhook 支持 | 无 | 有 |

### 实施步骤

#### 1. 创建 GitHub App

访问 https://github.com/settings/apps/new

**配置项：**
- Homepage URL: `https://gitfolio-x.com`
- Callback URL: `https://gitfolio-x.com/api/github/callback`
- Permissions:
  - `read:user` - 读取用户信息
  - `read:org` - 读取组织信息  
  - `repo` - 读取仓库内容（如果需要私有仓库）

**Webhooks:**
- URL: `https://gitfolio-x.com/api/github/webhook`
- Secret: 生成随机字符串

#### 2. 生成私钥

在 GitHub App 设置页面生成私钥（.pem 文件）

#### 3. 环境变量配置

```bash
# Supabase Environment Variables
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----..."
GITHUB_APP_CLIENT_ID=xxx
GITHUB_APP_CLIENT_SECRET=yyy
```

#### 4. 安装 App

用户通过 GitHub 安装页面安装到自己的账户

#### 5. Edge Function 实现

```typescript
// 获取 Installation Access Token
async function getInstallationToken(
  installationId: string
): Promise<string> {
  const jwt = createAppJWT(GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY)
  
  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  )
  
  const data = await response.json()
  return data.token
}
```

### 降级策略

如果用户未安装 GitHub App，降级使用公开 API（只读公开仓库）：

```typescript
async function getGitHubToken(userId: string): Promise<string | null> {
  // 1. 检查用户是否安装了 GitHub App
  const installation = await getInstallation(userId)
  if (installation) {
    return getInstallationToken(installation.id)
  }
  
  // 2. 检查是否有用户 PAT
  const userPAT = await getUserPAT(userId)
  if (userPAT) {
    return userPAT
  }
  
  // 3. 降级为公开 API
  return null
}
```

## 迁移时间表

| 阶段 | 内容 | 时间 |
|------|------|------|
| Phase 1 | 创建文档和配置指南 | 第1周 |
| Phase 2 | 实现 GitHub App 认证 | 第2周 |
| Phase 3 | 用户迁移和测试 | 第3周 |
| Phase 4 | 废弃 PAT 方式 | 第4周 |

## 相关资源

- [GitHub Apps 文档](https://docs.github.com/en/apps)
- [Creating a GitHub App](https://docs.github.com/en/apps/creating-github-apps)
- [Authentication with GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app)

## 总结

这是一个较大的架构改动，建议在后续版本中实施。短期内可以：

1. 添加 PAT 权限警告提示
2. 记录 PAT 使用情况
3. 提供迁移到 GitHub App 的引导

---

**Issue:** #10
**Priority:** Low
**Estimated Time:** 4 hours implementation + 2 weeks testing
