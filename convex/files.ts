import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { validateCoverImageFile } from "../lib/cover-image-upload";
import { requireCurrentOrganizer } from "./users";

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
    await requireCurrentOrganizer(ctx);

    const metadata = await ctx.storage.getMetadata(args.storageId);
    const validation = validateCoverImageFile({
      type: metadata?.contentType ?? undefined,
      size: metadata?.size ?? 0,
    });

    if (validation.isValid) return args.storageId;

    await ctx.storage.delete(args.storageId);
    throw new Error(validation.message);
  },
});
