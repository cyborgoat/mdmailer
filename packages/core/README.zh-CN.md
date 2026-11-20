[English](README.md) | 简体中文

# @goatcheese/mdmailer-core

在 Node.js、浏览器或 WebView 应用中，将 Markdown 渲染为带有品牌样式的 HTML 邮件，并生成 EML 文件。如需在终端实时预览或导出 PNG，请使用 [mdmailer 命令行工具](https://github.com/cyborgoat/mdmailer/blob/main/README.zh-CN.md)。

## 安装

在应用的项目目录中运行：

```sh
npm install @goatcheese/mdmailer-core
```

## 使用指南

### 渲染 Markdown 草稿

将 Markdown 原文、解析后的品牌配置和图片适配器传给 `renderEmail`。示例使用内嵌标志，可换成自己的标志。草稿引用本地图片时，请提供相应的读取方法。

```js
import { parseConfig, renderEmail } from "@goatcheese/mdmailer-core";

const markdown = `---
title: 团队简报
type: news
lang: zh
---

新版手册已发布。[查看手册](https://example.com/handbook).`;

const config = parseConfig({
  organization: {
    name: "Example",
    logoUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  },
  theme: { primaryColor: "#1A73E8", footerText: "© Example" },
});

const rendered = await renderEmail(markdown, {
  config,
  images: {
    async read(ref) {
      throw new Error(`No local image adapter for ${ref}`);
    },
  },
  plainText: true,
});

console.log(rendered.title); // 团队简报
```

返回结果包含邮件主题、初始 HTML、纯文本正文、内容宽度和图片附件信息。要生成二维码并写入图片尺寸，需要在 DOM 中处理初始 HTML。

### 在浏览器中生成最终 HTML 和 EML

在同一个浏览器模块中，把初始 HTML 加载到已插入页面的 iframe，并将 iframe 的宽度设为邮件内容宽度，以便测量图片尺寸。

```js
import {
  buildEml,
  collectEmlAttachments,
  postProcessDocument,
  serializeDocument,
} from "@goatcheese/mdmailer-core";

const frame = document.createElement("iframe");
frame.setAttribute("sandbox", "allow-same-origin");
frame.style.cssText = `position:fixed;left:-9999px;width:${rendered.contentWidth}px`;
const loaded = new Promise((resolve) => {
  frame.addEventListener("load", resolve, { once: true });
});
frame.srcdoc = rendered.html;
document.body.append(frame);

let html;
let eml;
try {
  await loaded;
  const doc = frame.contentDocument;
  const { qrImages } = await postProcessDocument(doc);
  html = serializeDocument(doc);
  eml = buildEml({
    subject: rendered.title,
    html,
    text: rendered.text,
    attachments: collectEmlAttachments(rendered, qrImages),
  });
} finally {
  frame.remove();
}
```

在 Node.js 中，可以用浏览器页面处理 DOM。如果使用的 DOM 环境无法计算布局，可通过 `imageSizes` 传入测得的图片尺寸。命令行工具使用 `inPageCall` 分阶段处理 DOM。[命令行渲染源码](https://github.com/cyborgoat/mdmailer/blob/main/packages/cli/src/screenshot.ts)

## 图片适配器

| 方法 | 何时提供 | 返回值 |
| --- | --- | --- |
| `read(ref)` | 必须提供。用于读取本地标志、正文图片和主持人照片。HTTP(S) 地址和数据 URL 会跳过此方法。 | 图片字节及 MIME 类型。 |
| `rasterize(img, { height })` | 输入包含本地 SVG 时提供。 | PNG 字节和图片尺寸，可按指定高度缩放。 |
| `measure(img)` | 需要读取位图尺寸时提供。无法获取尺寸时，标志会采用默认宽高比。 | 图片的像素宽度和高度。 |

文件读取和图片转换由调用方提供。如需导出 PNG，请使用命令行工具。

## API 参考

主要入口为 `parseConfig`、`renderEmail`、`postProcessDocument`、`serializeDocument`、`collectEmlAttachments` 和 `buildEml`。软件包还导出配置结构、预设主题、模板名称、`qrDataUrl` 和各 DOM 处理步骤。当前 API 处于 0.x 阶段。[公开导出列表](https://github.com/cyborgoat/mdmailer/blob/main/packages/core/src/index.ts)

## 许可证

[MIT](LICENSE)
