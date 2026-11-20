[English](README.md) | 简体中文

# mdmailer

用 Markdown 编写带有品牌样式的简报、通知和邀请函。写作时可在浏览器中预览，完成后可导出 HTML 邮件、供邮件客户端打开和发送的 EML 文件，以及便于分享的 PNG 图片。

## 配合智能体使用

在准备编写邮件的目录中安装 [mdmailer 技能](SKILL.md)：

```sh
npx skills add cyborgoat/mdmailer --skill mdmailer
```

然后向智能体描述任务：

> 用 mdmailer 写一封中文简报，介绍新版团队手册。使用默认品牌样式，把 HTML、EML 和 PNG 保存到 `emails/`。

智能体可以通过 npm 获取命令行工具、创建项目配置并导出邮件。此流程需要 Node.js 24 或更高版本及 npm。

## 安装

需要 **Node.js 24 或更高版本**。在存放邮件项目的目录中安装命令行工具，然后运行初始化向导：

```sh
npm install @goatcheese/mdmailer
npx mdmailer init
```

将项目名称设为 “team-mail”，然后选择主题。向导会创建 `team-mail/` 目录，里面有中英文邮件模板、品牌配置文件和占位标志。

## 使用指南

### 1. 编辑邮件模板

打开 `team-mail/templates/news.zh.md`，把示例内容换成自己的简报。也可以从[中文简报模板](packages/cli/templates/news.zh.md)或[英文简报模板](packages/cli/templates/news.md)开始。

保留文件顶部由两行 `---` 包住的 YAML 元数据。用 `title` 设置邮件主题，用 `type` 选择邮件版式，例如 `news`（简报）或 `invitation`（邀请函）。用 `lang` 指定内置标签的语言（中文为 `zh`，英文为 `en`），然后用 Markdown 编写正文。

### 2. 边写边预览

运行 `cd team-mail` 进入项目目录，然后启动预览：

```sh
npx mdmailer preview templates/news.zh.md
```

在浏览器中打开终端显示的本地地址。保存 Markdown 或品牌配置后，页面会自动刷新。用 **Desktop** 和 **Mobile** 检查桌面和手机上的排版，完成后按 **Ctrl+C** 停止预览。

### 3. 导出并发送

在 `team-mail/` 目录中生成最终文件：

```sh
npx mdmailer templates/news.zh.md --output emails
```

生成的文件保存在 `emails/` 目录中：

| 文件 | 用途 |
| --- | --- |
| `news.zh.html` | 在浏览器中查看导出的邮件。 |
| `news.zh.eml` | 在邮件客户端中打开，添加收件人并发送。 |
| `news.zh.png` | 以图片形式分享邮件，其中的链接会生成可扫描的二维码。 |

只需 HTML 和 EML 时，可加上 `--format html,eml`。要批量导出 `templates/` 目录直属的所有 Markdown 文件，将输入路径 `templates/news.zh.md` 换成 `templates/`。

## 品牌配置

在邮件项目的 `mdmailer.config.json` 中设置组织名称、标志、品牌色和页脚。可以用自己的标志替换 `assets/logo.svg`，也可以将 `organization.logoUrl` 改为其他文件路径或 HTTPS 地址。

用 `theme.preset` 设置项目的默认主题，可选 `classic`、`navy-gold` 或 `forest-cream`。简报模板在顶部设有 `theme: classic`。修改此字段可为当前草稿选择主题，删除此字段则使用项目的默认主题。

如需查看其他版式、元数据字段、品牌选项和浏览器设置，请参阅[命令行参考](packages/cli/README.zh-CN.md)和[中英文邮件模板](packages/cli/templates)。

## 开发

在本仓库根目录运行 `npm ci`、`npm run build`、`npm run typecheck` 和 `npm test`。`npm run check:golden` 用于比对模板输出，`npm run check:browser` 用于验证浏览器构建。若要在代码中调用 mdmailer，请参阅[核心库文档](packages/core/README.zh-CN.md)。

## 许可证

[MIT](LICENSE)
