import { describe, expect, test } from "vitest";
import type { Id } from "../convex/_generated/dataModel";
import {
  getTrustedCoverImageUrl,
  maxCoverImageBytes,
  validateCoverImageFile,
} from "../lib/cover-image-upload";
import { isCoverImageUploadOwnedByOrganizer } from "../convex/files";

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

describe("cover image upload ownership", () => {
  test("allows only the organizer that validated the upload", () => {
    expect(
      isCoverImageUploadOwnedByOrganizer({
        upload: { storageId: ("storage_1" as Id<"_storage">), organizerId: ("organizer_1" as Id<"organizers">) },
        storageId: ("storage_1" as Id<"_storage">),
        organizerId: ("organizer_1" as Id<"organizers">),
      }),
    ).toBe(true);
    expect(
      isCoverImageUploadOwnedByOrganizer({
        upload: { storageId: ("storage_1" as Id<"_storage">), organizerId: ("organizer_2" as Id<"organizers">) },
        storageId: ("storage_1" as Id<"_storage">),
        organizerId: ("organizer_1" as Id<"organizers">),
      }),
    ).toBe(false);
  });
});


describe("trusted cover image URL persistence", () => {
  test("clears arbitrary URLs that are not backed by Convex storage", () => {
    expect(
      getTrustedCoverImageUrl({
        coverImageUrl: "https://example.com/tracker.png",
        coverImageStorageId: undefined,
      }),
    ).toBeUndefined();
  });

  test("clears client-provided URLs even when a storage ID is present", () => {
    expect(
      getTrustedCoverImageUrl({
        coverImageUrl: "blob:preview",
        coverImageStorageId: "storage_1",
      }),
    ).toBeUndefined();
  });
});
