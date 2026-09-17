export type Locale = "en" | "zh";

export type MessageKey =
  | "detail.when"
  | "detail.where"
  | "detail.join"
  | "detail.hosts"
  | "section.agenda"
  | "section.hosts"
  | "kicker.meeting"
  | "kicker.webinar"
  | "kicker.news"
  | "banner.notification"
  | "footer.unsubscribe"
  | "fallback.untitled";

export type Messages = Record<MessageKey, string>;
