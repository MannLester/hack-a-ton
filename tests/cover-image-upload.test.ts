import { describe, expect, test } from "vitest";
import {
  maxCoverImageBytes,
  validateCoverImageFile,
} from "../lib/cover-image-upload";

describe("cover image upload validation", () => {
  test("allows PNG, JPEG, and WebP under the max size", () => {
    expect(
      validateCoverImageFile({ type: "image/png", size: maxCoverImageBytes }),
    ).toEqual({ isValid: true });
    expect(validateCoverImageFile({ type: "image/jpeg", size: 1024 })).toEqual({
      isValid: true,
    });
    expect(validateCoverImageFile({ type: "image/webp", size: 1024 })).toEqual({
      isValid: true,
    });
  });

  test("rejects unsupported MIME types", () => {
    expect(validateCoverImageFile({ type: "image/gif", size: 1024 })).toEqual({
      isValid: false,
      message: "Cover image must be PNG, JPEG, or WebP.",
    });
  });

  test("rejects oversized files", () => {
    expect(
      validateCoverImageFile({
        type: "image/png",
        size: maxCoverImageBytes + 1,
      }),
    ).toEqual({
      isValid: false,
      message: "Cover image must be 5 MB or smaller.",
    });
  });

  test("rejects empty file types", () => {
    expect(validateCoverImageFile({ type: "", size: 1024 })).toEqual({
      isValid: false,
      message: "Choose a PNG, JPEG, or WebP image.",
    });
  });
});
