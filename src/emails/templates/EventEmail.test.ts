import assert from "node:assert/strict";
import test from "node:test";
import { render } from "@react-email/render";
import * as React from "react";
import EventEmail from "./EventEmail.js";
import { t } from "../../i18n/index.js";

test("event date and time render once inside the details card in both languages", async () => {
  for (const locale of ["en", "zh"] as const) {
    const props = {
      ...EventEmail.PreviewProps,
      locale,
      agenda: null,
      labels: { ...EventEmail.PreviewProps.labels, when: t(locale, "detail.when") },
    };
    const html = await render(React.createElement(EventEmail, props));
    const card = html.indexOf(`border:1px solid ${props.theme.border}`);
    const when = html.indexOf(`>${props.labels.when}</p>`);
    const value = html.indexOf(`${props.startsAt} · ${props.time}`);
    const where = html.indexOf(`>${props.labels.where}</p>`);
    assert.ok(card >= 0 && card < when && when < value && value < where);
    assert.equal(html.split(props.time).length - 1, 1);
  }
});

test("time alone creates a details row and absent date/time omits it", async () => {
  const props = {
    ...EventEmail.PreviewProps,
    startsAt: "",
    location: undefined,
    joinUrl: undefined,
    hosts: [],
    hostProfiles: [],
    agenda: null,
  };
  const html = await render(React.createElement(EventEmail, props));
  assert.match(html, />When<\/p>/);
  assert.ok(html.includes(props.time));
  const empty = await render(React.createElement(EventEmail, { ...props, time: undefined }));
  assert.doesNotMatch(empty, />When<\/p>/);
  assert.ok(!empty.includes(`border:1px solid ${props.theme.border}`));
});
