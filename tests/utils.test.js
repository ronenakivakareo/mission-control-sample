import { test } from "node:test";
import assert from "node:assert/strict";
import { average, slugify } from "../src/utils.js";

test("average returns the mean of a non-empty list", () => {
  assert.equal(average([1, 2, 3]), 2);
});

test("slugify lowercases and hyphenates", () => {
  assert.equal(slugify("Hello, World!"), "hello-world");
});

test("slugify trims leading and trailing separators", () => {
  assert.equal(slugify("  --Mission Control--  "), "mission-control");
});
