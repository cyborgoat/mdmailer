import { Link, Text } from "react-email";
import * as React from "react";
import type { SocialLink } from "../../config-schema.js";
import type { EmailTheme } from "../theme.js";

interface SocialLinksProps {
  links: SocialLink[];
  theme: EmailTheme;
}

/**
 * A single line of text links joined by " · " — e.g. GitHub · LinkedIn · Blog.
 * Text only (no icon images) so it renders everywhere, Outlook included.
 * Returns nothing when there are no links.
 */
export function SocialLinks({ links, theme }: SocialLinksProps) {
  if (links.length === 0) return null;

  return (
    <Text style={{ fontFamily: theme.fontFamily, fontSize: "12px", color: theme.mutedForeground, textAlign: "center", margin: "20px 0 0" }}>
      {links.map((link, index) => (
        <React.Fragment key={link.url}>
          {index > 0 ? " · " : null}
          <Link href={link.url} style={{ fontFamily: theme.fontFamily, color: theme.accent }}>
            {link.label}
          </Link>
        </React.Fragment>
      ))}
    </Text>
  );
}
