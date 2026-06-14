import { mutation } from "./_generated/server";

export const generateCoverImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return ctx.storage.generateUploadUrl();
  },
});
