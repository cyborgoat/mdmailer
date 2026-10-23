import assert from "node:assert/strict";
import test from "node:test";
import matter from "gray-matter";
import { parseFrontmatter } from "./frontmatter.js";

// gray-matter was the previous parser; stay byte-for-byte compatible with it.
const cases: Record<string, string> = {
  basic: "---\ntitle: Hi\ntype: news\n---\nBody\n",
  "no frontmatter": "Just body\n",
  "dates and lists": "---\ndate: 2026-10-22\ntags: [a, b]\nhosts:\n  - name: Maya\n    role: Lead\n---\n\nBody\n\n---\n\nMore",
  crlf: "---\r\ntitle: Hi\r\n---\r\nBody\r\n",
  bom: "﻿---\ntitle: Hi\n---\nBody",
  empty: "---\n---\nBody",
  "comment only": "---\n# nothing\n---\nBody",
  unterminated: "---\ntitle: Hi\nsubtitle: There\n",
  "thematic break": "----\nnot frontmatter\n",
  "yes/no stay strings": "---\na: yes\nb: no\n---\nx",
  "chinese quoted": "---\ntitle: \"你好: 世界\"\nlang: zh\n---\n正文",
  "no trailing newline": "---\na: 1\n---",
};

for (const [name, input] of Object.entries(cases)) {
  test(`parseFrontmatter matches gray-matter: ${name}`, () => {
    const expected = matter(input);
    const actual = parseFrontmatter(input);
    assert.deepEqual(actual.data, expected.data);
    assert.equal(actual.content, expected.content);
  });
}
