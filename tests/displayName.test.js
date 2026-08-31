import { test } from "node:test";
import assert from "node:assert/strict";
import { displayName } from "../src/utils.js";

test("displayName returns empty string for null user", () => {
  assert.equal(displayName(null), "");
});

test("displayName returns empty string for a user with no name", () => {
  assert.equal(displayName({}), "");
});
