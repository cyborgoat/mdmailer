import { z } from "zod";

// Outlook desktop (the Word rendering engine) can only match web-safe fonts
// already installed on the system — no @font-face / web fonts — so this
// sticks to fonts that ship with Windows and macOS and covers both Latin
// and Simplified Chinese glyphs.
export const DEFAULT_FONT_FAMILY =
  '"Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, "PingFang SC", sans-serif';

const brandSchema = z.object({
  name: z.string(),
  // Either a hosted "https://..." URL, or a path (relative to the repo root)
  // to a local image in assets/ — local logos get embedded as a data URI
  // at generation time so no hosting is required.
  logoUrl: z.string().min(1),
  // Optional artwork designed for colored/dark backgrounds. Contrast themes
  // select this asset instead of relying on poorly-supported CSS filters.
  logoUrlOnDark: z.string().min(1).optional(),
});

// One entry in the shared footer's social row. Rendered as a plain
// text link (no icon image) so it survives blocked images and Outlook alike.
const socialLinkSchema = z.object({
  label: z.string(),
  url: z.string().min(1),
});

const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Expected a six-digit hex color such as #1A4B8C");

export const themeColorsSchema = z.object({
  background: hexColorSchema.optional(),
  foreground: hexColorSchema.optional(),
  mutedForeground: hexColorSchema.optional(),
  accent: hexColorSchema.optional(),
  surface: hexColorSchema.optional(),
  border: hexColorSchema.optional(),
});

export const THEME_PRESETS = {
  classic: {
    appearance: "light",
    background: "#ffffff",
    foreground: "#333333",
    mutedForeground: "#52665d",
    accent: "#1A73E8",
    surface: "#f2f2f2",
    border: "#e6e6e6",
  },
  "cobalt-mint": {
    appearance: "contrast",
    background: "#1A4B8C",
    foreground: "#FFFFFF",
    mutedForeground: "#D9E5F2",
    accent: "#A7F3D0",
    surface: "#143B70",
    border: "#6F91BC",
  },
  "navy-gold": {
    appearance: "contrast",
    background: "#14213D",
    foreground: "#FFFFFF",
    mutedForeground: "#D6DCE8",
    accent: "#FFD166",
    surface: "#0B132B",
    border: "#52617A",
  },
  "forest-cream": {
    appearance: "contrast",
    background: "#173F35",
    foreground: "#FFF8E7",
    mutedForeground: "#D7E5D8",
    accent: "#FFD166",
    surface: "#0F3028",
    border: "#6F8F83",
  },
  "plum-rose": {
    appearance: "contrast",
    background: "#4A1942",
    foreground: "#FFF7FB",
    mutedForeground: "#E9D4E3",
    accent: "#FFC2D1",
    surface: "#35112F",
    border: "#956487",
  },
} as const;

export type ThemePresetName = keyof typeof THEME_PRESETS;
export const THEME_PRESET_NAMES = Object.keys(THEME_PRESETS) as [ThemePresetName, ...ThemePresetName[]];
export const CONTRAST_THEME_DEFAULTS = THEME_PRESETS["cobalt-mint"];

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(first: string, second: string): number {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  return (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05);
}

const themeSelectionObjectSchema = z.object({
  preset: z.enum(THEME_PRESET_NAMES).default("classic"),
  colors: themeColorsSchema.default({}),
});

export const frontmatterThemeSchema = z.union([
  z.enum(THEME_PRESET_NAMES),
  themeSelectionObjectSchema,
]).default("classic").superRefine((selection, ctx) => {
  const theme = typeof selection === "string"
    ? { preset: selection, colors: {} }
    : selection;
  const preset = THEME_PRESETS[theme.preset];
  if (preset.appearance !== "contrast") return;

  const colors = { ...preset, ...theme.colors };
  const pairs = [
    ["foreground", "background"],
    ["mutedForeground", "background"],
    ["accent", "background"],
    ["foreground", "surface"],
    ["accent", "surface"],
  ] as const;

  for (const [textToken, backgroundToken] of pairs) {
    const ratio = contrastRatio(colors[textToken], colors[backgroundToken]);
    if (ratio < 4.5) {
      ctx.addIssue({
        code: "custom",
        path: typeof selection === "string" ? [] : ["colors", textToken],
        message: `${textToken} against ${backgroundToken} has a ${ratio.toFixed(2)}:1 contrast ratio; WCAG AA requires at least 4.50:1`,
      });
    }
  }
});

const themeSchema = z.object({
  primaryColor: z.string(),
  footerText: z.string(),
  tagline: z.string().default("Flowing intelligence across the network."),
  // Web-safe fonts only — Outlook desktop's Word rendering engine can't
  // load @font-face/web fonts. Defaults to a stack covering both Latin
  // and Simplified Chinese glyphs.
  fontFamily: z.string().default(DEFAULT_FONT_FAMILY),
  // Max width (px) of the email's content column. Applies to every template.
  contentWidth: z.number().positive().default(680),

  // Optional shared-footer metadata. Existing configs without it keep working.
  social: z.array(socialLinkSchema).default([]),
  // Postal address line.
  address: z.string().optional(),
  // "Unsubscribe" link target.
  unsubscribeUrl: z.string().optional(),
});

export const configSchema = z.object({
  organization: brandSchema,
  theme: themeSchema,
});

export type Config = z.infer<typeof configSchema>;
export type Brand = z.infer<typeof brandSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type ThemeColors = z.infer<typeof themeColorsSchema>;
export type FrontmatterTheme = z.infer<typeof frontmatterThemeSchema>;
