import { z } from "zod";

// Outlook desktop (the Word rendering engine) can only match web-safe fonts
// already installed on the system — no @font-face / web fonts — so this
// sticks to fonts that ship with Windows and macOS and covers both Latin
// and Simplified Chinese glyphs.
export const DEFAULT_FONT_FAMILY =
  '"Helvetica Neue", Helvetica, Arial, "PingFang SC", "Microsoft YaHei", sans-serif';

const brandSchema = z.object({
  name: z.string(),
  // Either a hosted "https://..." URL, or a path (relative to the repo root)
  // to a local image in assets/ — local logos get embedded as a data URI
  // at generation time so no hosting is required.
  logoUrl: z.string().min(1),
});

// One entry in the event/announcement footer's social row. Rendered as a plain
// text link (no icon image) so it survives blocked images and Outlook alike.
const socialLinkSchema = z.object({
  label: z.string(),
  url: z.string().min(1),
});

export const configSchema = z.object({
  organization: brandSchema,
  theme: z.object({
    primaryColor: z.string(),
    footerText: z.string(),
    slogan: z.string().default("Flowing intelligence across the network"),
    // Web-safe fonts only — Outlook desktop's Word rendering engine can't
    // load @font-face/web fonts. Defaults to a stack covering both Latin
    // and Simplified Chinese glyphs.
    fontFamily: z.string().default(DEFAULT_FONT_FAMILY),

    // The keys below are optional and only used by the non-default templates
    // (event/workshop, announcement). Existing configs without them keep working.

    // Call-to-action button background for the event/announcement templates.
    // Falls back to `primaryColor` when unset.
    accentColor: z.string().optional(),
    // Social links for the event/announcement footer. Empty renders nothing.
    social: z.array(socialLinkSchema).default([]),
    // Postal address line for the event footer.
    address: z.string().optional(),
    // "Unsubscribe" link target for the event footer.
    unsubscribeUrl: z.string().optional(),
  }),
});

export type Config = z.infer<typeof configSchema>;
export type Brand = z.infer<typeof brandSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
