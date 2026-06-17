import { describe, expect, test } from "vitest";
import { getOfficialRegistrationUrl } from "../lib/hackathon-links";

describe("hackathon links", () => {
  test("uses the official registration URL when present", () => {
    expect(
      getOfficialRegistrationUrl({
        registrationUrl: "https://example.com/register",
        sourceUrl: "https://example.com/source",
      }),
    ).toBe("https://example.com/register");
  });

  test("falls back to the source URL when no registration URL is present", () => {
    expect(
      getOfficialRegistrationUrl({
        registrationUrl: "",
        sourceUrl: "https://example.com/source",
      }),
    ).toBe("https://example.com/source");
  });

  test("returns undefined when no usable external link exists", () => {
    expect(
      getOfficialRegistrationUrl({
        registrationUrl: "   ",
        sourceUrl: undefined,
      }),
    ).toBeUndefined();
  });
});
