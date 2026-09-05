import { Link, Text } from "react-email";
import * as React from "react";
import type { SocialLink } from "../../config-schema.js";

interface SocialLinksProps {
  links: SocialLink[];
  fontFamily: string;
}

/**
 * A single line of text links joined by " · " — e.g. GitHub · LinkedIn · Blog.
 * Text only (no icon images) so it renders everywhere, Outlook included.
 * Returns nothing when there are no links.
 */
export function SocialLinks({ links, fontFamily }: SocialLinksProps) {
  if (links.length === 0) return null;

  return (
    <Text style={{ fontFamily, fontSize: "12px", color: "#52665d", textAlign: "center", margin: "20px 0 0" }}>
      {links.map((link, index) => (
        <React.Fragment key={link.url}>
          {index > 0 ? " · " : null}
          <Link href={link.url} style={{ fontFamily, color: "#52665d" }}>
            {link.label}
          </Link>
        </React.Fragment>
      ))}
    </Text>
  );
}
