import { test } from "node:test";
import assert from "node:assert/strict";
import { truncate } from "../src/utils.js";

test("truncate shortens long text to maxLength", () => {
  const result = truncate("Hello, World!", 8);
  assert.equal(result.length, 8);
  assert.equal(result, "Hello...");
});

test("truncate returns short text unchanged", () => {
  assert.equal(truncate("Hi", 10), "Hi");
});
