import { mutation } from "./_generated/server";
import { requireCurrentOrganizer } from "./users";

export const generateCoverImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireCurrentOrganizer(ctx);

    return ctx.storage.generateUploadUrl();
  },
});
