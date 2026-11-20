[English](README.md) | 简体中文

# mdmailer

用 Markdown 编写简报、通知和邀请函，在浏览器中预览，再导出 HTML、EML 和带二维码的 PNG 图片。用邮件客户端打开 EML，添加收件人后发送。

## 快速开始

需要 **Node.js 24 或更高版本**。在存放邮件项目的目录中安装命令行工具，并启动初始化向导：

```sh
npm install @goatcheese/mdmailer
npx mdmailer init
```

输入项目名称 “team-mail”，然后选择主题。向导会创建项目目录，内含品牌配置、占位标志和[中文](templates/news.zh.md)及[英文](templates/news.md)邮件模板。编辑简报正文，再运行 `cd team-mail` 进入项目目录。

如需全局安装，运行 `npm install -g @goatcheese/mdmailer`，之后可直接调用 `mdmailer`。在非交互式会话中，`init` 会在当前目录创建所需文件，并跳过已有文件。

## 实时预览

```sh
npx mdmailer preview templates/news.zh.md
npx mdmailer preview templates/news.zh.md --theme navy-gold --port 3001
```

在浏览器中打开终端显示的地址。保存 Markdown 或品牌配置时，预览会自动刷新。用 **Desktop** 和 **Mobile** 切换桌面与手机宽度。配置或元数据出错时，页面会显示错误并保留上一次成功的预览。

预览一次打开一封邮件，默认监听 `127.0.0.1:3000`，用 `--port 0` 可自动选择空闲端口。单独更改图片文件后，需要重启预览。完成后按 **Ctrl+C** 停止预览，并运行导出命令保存文件。

## 导出并发送

```sh
npx mdmailer templates/news.zh.md --output emails
```

在 `emails/` 中打开 **news.zh.html** 查看效果，用邮件客户端打开 **news.zh.eml** 发送邮件，或分享 **news.zh.png** 图片。

```sh
npx mdmailer templates/ --output emails
npx mdmailer templates/news.zh.md --output emails --format html,eml
npx mdmailer templates/news.zh.md --output emails --theme navy-gold
```

- 必须指定 `--output <folder>`。工具会创建缺失的目录。用 `--output .` 可写入当前目录。
- 默认导出 HTML、EML 和 PNG。用 `--format` 指定以逗号分隔的格式。
- 批量模式按文件名顺序处理输入目录直属的 Markdown 文件，遇到第一处错误时停止。
- 运行 `npx mdmailer --help` 查看完整选项。

三种格式使用同一套排版。链接会保留文字并附上编号，页脚上方会列出链接、电子邮件地址和电话号码对应的二维码。PNG 以两倍宽度呈现整封邮件。

### 浏览器设置

排版需要 Chrome。mdmailer 会尝试使用 Puppeteer 安装的 Chrome，其次查找本机的 Chrome 或 Chromium，必要时联网下载。可以用 `PUPPETEER_EXECUTABLE_PATH` 指定浏览器路径。生成时，远程图片地址必须可访问。

## 编写邮件

```markdown
---
title: "团队简报"
type: news
lang: zh
date: 2026-10-01
---

## 本周进展

正文支持 **加粗**、列表、表格和 [链接](https://example.com)。
```

| 字段 | 含义 |
| --- | --- |
| `type` | 必填。可选 `news`、`notification`、`meeting`、`event`、`invitation`、`webinar`。 |
| `lang` | 必填。用 `zh` 或 `en` 选择内置标签的语言，正文仍需自行用相应语言编写。 |
| `title` | 邮件主题，也是默认标题。 |
| `theme` | 当前草稿的主题。 |
| `date` | 简报日期，也可作为活动缺少 `startsAt` 时的默认日期。 |

通知可用 `headline` 设置标题，用 `banner` 添加醒目提示。会议、活动、邀请函和网络研讨会还可以使用以下字段：

| 字段 | 含义 |
| --- | --- |
| `eventName`、`kicker` | 活动标题及其上方的小标签。标题默认使用 `title`。 |
| `startsAt`、`time`、`location` | 活动日期、加引号的时间，以及会场或线上地点。 |
| `joinUrl`、`rsvpUrl` | 入会或报名链接，以及邀请函的回复链接。回复链接默认使用 `joinUrl`。 |
| `hosts` | 主持人姓名列表，或带有 `name`、可选 `role`、`bio` 和 `photo` 的对象列表。 |
| `agenda` | Markdown 文本、字符串列表，或由 `{ time, title }` 对象组成的列表。 |

## 品牌与主题

在 `mdmailer.config.json` 设置组织名称、标志、品牌色和页脚：

```json
{
  "organization": {
    "name": "示例团队",
    "logoUrl": "assets/logo.svg"
  },
  "theme": {
    "primaryColor": "#1A73E8",
    "tagline": "团队简报",
    "footerText": "© 2026 {{organization}}",
    "preset": "classic"
  }
}
```

- 主题包括浅色 `classic`、深蓝配金色 `navy-gold`、深绿配米色 `forest-cream`。优先级依次为 `--theme`、草稿的 `theme`、配置中的 `theme.preset`，最后是 `classic`。删除模板顶部的 `theme` 字段即可使用项目默认主题。
- 选择配置文件时，先检查 `--config <file>`，再检查当前目录的 `mdmailer.config.json`，最后检查 `~/.mdmailer/mdmailer.config.json`。用 `npx mdmailer init --global` 创建用户级配置。
- 标志、正文图片和主持人照片支持本地文件或 HTTPS 地址。标志路径相对于配置文件，正文图片和主持人照片路径相对于运行命令的目录。
- 可用 `organization.logoUrlOnDark` 指定深色主题的标志。`theme` 还支持 `fontFamily`、`contentWidth`、`social`、`address` 和 `unsubscribeUrl`。
- 如需覆盖单封邮件的配色，可在元数据的 `theme.colors` 中设置 `background`、`foreground`、`mutedForeground`、`accent`、`surface` 和 `border`。十六进制颜色值需加引号。

## 配合智能体使用

在准备编写邮件的目录中安装 [mdmailer 技能](https://github.com/cyborgoat/mdmailer/blob/main/SKILL.md)：

```sh
npx skills add cyborgoat/mdmailer --skill mdmailer
```

告诉智能体要写什么邮件、需要哪些输出。技能可以获取命令行工具并初始化项目。如果已运行过 `init`，也可以请智能体阅读它复制到邮件项目中的 `SKILL.md`。

## 开发

构建和测试命令见[仓库指南中的开发部分](https://github.com/cyborgoat/mdmailer/blob/main/README.zh-CN.md#开发)。

## 许可证

[MIT](LICENSE)
