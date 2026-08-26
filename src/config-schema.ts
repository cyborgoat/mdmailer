import { z } from "zod";

const brandSchema = z.object({
  name: z.string(),
  // Either a hosted "https://..." URL, or a path (relative to the repo root)
  // to a local image in assets/ — local logos get embedded as a data URI
  // at generation time so no hosting is required.
  logoUrl: z.string().min(1),
});

export const configSchema = z.object({
  organization: brandSchema,
  theme: z.object({
    primaryColor: z.string(),
    footerText: z.string(),
    slogan: z.string().default("Flowing intelligence across the network"),
  }),
});

export type Config = z.infer<typeof configSchema>;
export type Brand = z.infer<typeof brandSchema>;
