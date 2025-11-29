import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";

describe("demo.api.names", () => {
  it("should return the names", async () => {
    const response = await SELF.fetch("/demo/api/names");
    expect(response.status).toBe(200);
    expect(await response.json()).toBe([
      "Alice",
      "Bob",
      "Charlie"]);
  });
})