import { test } from "node:test";
import assert from "node:assert/strict";
import { average } from "../src/utils.js";

test("average returns 0 for an empty list rather than NaN", () => {
  assert.equal(average([]), 0);
});
