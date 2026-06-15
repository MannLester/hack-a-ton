export type CoverImageFileMetadata = {
  type?: string;
  size: number;
};

export type CoverImageValidationResult =
  | { isValid: true }
  | { isValid: false; message: string };

export const maxCoverImageBytes = 5 * 1024 * 1024;

const allowedCoverImageTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export function validateCoverImageFile(
  file: CoverImageFileMetadata,
): CoverImageValidationResult {
  if (!file.type) {
    return {
      isValid: false,
      message: "Choose a PNG, JPEG, or WebP image.",
    };
  }

  if (!allowedCoverImageTypes.has(file.type)) {
    return {
      isValid: false,
      message: "Cover image must be PNG, JPEG, or WebP.",
    };
  }

  if (file.size > maxCoverImageBytes) {
    return {
      isValid: false,
      message: "Cover image must be 5 MB or smaller.",
    };
  }

  return { isValid: true };
}


export function getTrustedCoverImageUrl(_input: {
  coverImageUrl?: string;
  coverImageStorageId?: unknown;
}) {
  return undefined;
}
