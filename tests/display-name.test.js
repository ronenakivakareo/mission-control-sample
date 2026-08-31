import { test } from "node:test";
import assert from "node:assert/strict";
import { displayName } from "../src/utils.js";

test("displayName returns empty string for null", () => {
  assert.equal(displayName(null), "");
});

test("displayName returns empty string for empty object", () => {
  assert.equal(displayName({}), "");
});
