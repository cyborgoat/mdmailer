export type Locale = "en" | "zh";

export type MessageKey =
  | "detail.when"
  | "detail.where"
  | "detail.join"
  | "detail.rsvp"
  | "link.joinMeeting"
  | "link.joinWebinar"
  | "link.joinEvent"
  | "link.respondInvitation"
  | "detail.hosts"
  | "section.agenda"
  | "section.hosts"
  | "kicker.meeting"
  | "kicker.invitation"
  | "kicker.webinar"
  | "kicker.news"
  | "banner.notification"
  | "footer.unsubscribe"
  | "fallback.untitled";

export type Messages = Record<MessageKey, string>;
