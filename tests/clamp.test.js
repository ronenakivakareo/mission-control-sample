import { test } from "node:test";
import assert from "node:assert/strict";
import { clamp } from "../src/utils.js";

test("clamp returns the value unchanged when within range", () => {
  assert.equal(clamp(5, 0, 10), 5);
});

test("clamp returns max when value is above the range", () => {
  assert.equal(clamp(15, 0, 10), 10);
});

test("clamp returns min when value is below the range", () => {
  assert.equal(clamp(-5, 0, 10), 0);
});
