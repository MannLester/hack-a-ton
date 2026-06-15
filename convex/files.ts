import { v } from "convex/values";
import { mutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { validateCoverImageFile } from "../lib/cover-image-upload";
import { requireCurrentOrganizer } from "./users";

type CoverImageUploadOwner = Pick<
  Doc<"coverImageUploads">,
  "storageId" | "organizerId"
>;

export function isCoverImageUploadOwnedByOrganizer({
  upload,
  storageId,
  organizerId,
}: {
  upload: CoverImageUploadOwner | null;
  storageId: Id<"_storage">;
  organizerId: Id<"organizers">;
}) {
  if (!upload) return false;
  if (upload.storageId !== storageId) return false;

  return upload.organizerId === organizerId;
}

async function getCoverImageUploadByStorageId(
  ctx: MutationCtx,
  storageId: Id<"_storage">,
) {
  return ctx.db
    .query("coverImageUploads")
    .withIndex("by_storage", (index) => index.eq("storageId", storageId))
    .unique();
}

export async function requireOwnedCoverImageUpload(
  ctx: MutationCtx,
  storageId: Id<"_storage"> | undefined,
  organizerId: Id<"organizers">,
) {
  if (!storageId) return;

  const upload = await getCoverImageUploadByStorageId(ctx, storageId);
  const isOwnedUpload = isCoverImageUploadOwnedByOrganizer({
    upload,
    storageId,
    organizerId,
  });

  if (!isOwnedUpload) {
    throw new Error("Cover image upload is not available for this organizer.");
  }
}

export const generateCoverImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireCurrentOrganizer(ctx);

    return ctx.storage.generateUploadUrl();
  },
});

export const validateCoverImageUpload = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const { currentUser, organizer } = await requireCurrentOrganizer(ctx);

    const metadata = await ctx.storage.getMetadata(args.storageId);
    const validation = validateCoverImageFile({
      type: metadata?.contentType ?? undefined,
      size: metadata?.size ?? 0,
    });

    if (!validation.isValid) {
      await ctx.storage.delete(args.storageId);
      throw new Error(validation.message);
    }

    const existingUpload = await getCoverImageUploadByStorageId(ctx, args.storageId);
    const now = Date.now();
    const uploadFields = {
      storageId: args.storageId,
      ownerUserId: currentUser._id,
      organizerId: organizer._id,
      validatedAt: now,
    };

    if (!existingUpload) {
      await ctx.db.insert("coverImageUploads", {
        ...uploadFields,
        createdAt: now,
      });
      return args.storageId;
    }

    if (existingUpload.organizerId !== organizer._id) {
      throw new Error("Cover image upload is not available for this organizer.");
    }

    await ctx.db.patch(existingUpload._id, uploadFields);
    return args.storageId;
  },
});
