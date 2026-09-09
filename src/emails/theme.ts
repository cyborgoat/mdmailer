import { THEME_PRESETS, type Brand, type Config, type FrontmatterTheme, type ThemeColors, type ThemePresetName } from "../config-schema.js";

export interface EmailTheme {
  appearance: "light" | "contrast";
  background: string;
  foreground: string;
  mutedForeground: string;
  accent: string;
  surface: string;
  border: string;
  fontFamily: string;
  contentWidth: number;
}

const LIGHT_THEME_DEFAULTS = {
  background: "#ffffff",
  foreground: "#333333",
  mutedForeground: "#52665d",
  surface: "#f2f2f2",
  border: "#e6e6e6",
} as const;

export const DEFAULT_EMAIL_PREVIEW_THEME: EmailTheme = {
  appearance: "light",
  ...LIGHT_THEME_DEFAULTS,
  accent: "#1A4B8C",
  fontFamily: '"Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, "PingFang SC", sans-serif',
  contentWidth: 680,
};

export interface ThemeSelection {
  preset: ThemePresetName;
  colors: ThemeColors;
}

export function normalizeThemeSelection(selection: FrontmatterTheme): ThemeSelection {
  return typeof selection === "string"
    ? { preset: selection, colors: {} }
    : selection;
}

export function resolveEmailTheme(theme: Config["theme"], selection: ThemeSelection): EmailTheme {
  const presetName = selection.preset;
  const preset = THEME_PRESETS[presetName];

  return {
    ...preset,
    accent: presetName === "classic" ? theme.primaryColor : preset.accent,
    ...selection.colors,
    fontFamily: theme.fontFamily,
    contentWidth: theme.contentWidth,
  };
}

export function headingColor(theme: EmailTheme): string {
  return theme.appearance === "contrast" ? theme.foreground : theme.accent;
}

export function selectLogoUrl(organization: Brand, appearance: EmailTheme["appearance"]): string {
  return appearance === "contrast" && organization.logoUrlOnDark
    ? organization.logoUrlOnDark
    : organization.logoUrl;
}
