export type Locale = "en" | "zh";

export type MessageKey =
  | "detail.where"
  | "detail.join"
  | "detail.hosts"
  | "section.agenda"
  | "section.hosts"
  | "kicker.workshop"
  | "kicker.webinar"
  | "banner.announcement"
  | "footer.unsubscribe"
  | "fallback.untitled";

export type Messages = Record<MessageKey, string>;
