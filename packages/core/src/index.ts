export { configSchema, frontmatterThemeSchema, THEME_PRESETS, THEME_PRESET_NAMES, DEFAULT_FONT_FAMILY, contrastRatio } from "./config-schema.js";
export type { Config, Brand, ThemeColors, ThemePresetName, FrontmatterTheme, SocialLink } from "./config-schema.js";
export { parseConfig } from "./config.js";
export { TEMPLATE_NAMES, resolveTemplateName } from "./emails/registry.js";
export { fmString, formatDate } from "./frontmatter.js";
export { resolveLocale } from "./i18n/index.js";
export { isRemoteRef, embedImage } from "./images.js";
export type {
  ImageIO, ImageData, EmbeddedImage, HostProfile, LogoAttachment, ResolvedOrganization,
} from "./images.js";
export { renderEmail } from "./render.js";
export type { RenderOptions, RenderedEmail } from "./render.js";
export { buildEml, collectEmlAttachments } from "./eml.js";
export type { EmlAttachment, EmlInput } from "./eml.js";
export {
  postProcessDocument, replaceLinksWithQrMarkers, insertQrImages, bakeImageSizes, serializeDocument, inPageCall,
} from "./post-process.js";
export type { PostProcessOptions } from "./post-process.js";
export { qrDataUrl } from "./qr.js";
export { toBase64, fromBase64, randomUUID } from "./bytes.js";
