import { Body, Container, Head, Html, Preview } from "react-email";
import * as React from "react";
import type { SocialLink } from "../../config-schema.js";
import type { Locale } from "../../i18n/index.js";
import type { ResolvedOrganization } from "../../resolve-logo.js";
import type { EmailTheme } from "../theme.js";
import { Footer } from "./Footer.js";
import { Header } from "./Header.js";

export interface EmailChromeProps {
  organization: ResolvedOrganization;
  theme: EmailTheme;
  footerText: string;
  tagline: string;
  social: SocialLink[];
  address?: string;
  unsubscribeUrl?: string;
  locale: Locale;
  unsubscribeLabel: string;
}

interface EmailShellProps extends EmailChromeProps {
  previewText: string;
  children: React.ReactNode;
}

/** Shared, email-client-safe document chrome used by every layout family. */
export function EmailShell({
  previewText,
  organization,
  theme,
  footerText,
  tagline,
  social,
  address,
  unsubscribeUrl,
  locale,
  unsubscribeLabel,
  children,
}: EmailShellProps) {
  return (
    <Html lang={locale}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Preview>{previewText}</Preview>
      <Body
        style={{
          backgroundColor: theme.background,
          color: theme.foreground,
          fontFamily: theme.fontFamily,
          margin: "0",
        }}
      >
        <Container
          style={{
            backgroundColor: theme.background,
            boxSizing: "border-box",
            maxWidth: `${theme.contentWidth}px`,
            padding: "24px",
            width: "100%",
          }}
        >
          <Header
            organizationName={organization.name}
            organizationLogoUrl={organization.logoUrl}
            logoAspectRatio={organization.logoAspectRatio}
            theme={theme}
            useLogoPlate={theme.appearance === "contrast" && !organization.logoUrlOnDark}
          />
          {children}
          <Footer
            organizationName={organization.name}
            tagline={tagline}
            footerText={footerText}
            theme={theme}
            social={social}
            address={address}
            unsubscribeUrl={unsubscribeUrl}
            unsubscribeLabel={unsubscribeLabel}
          />
        </Container>
      </Body>
    </Html>
  );
}
