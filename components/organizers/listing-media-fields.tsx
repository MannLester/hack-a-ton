export function ListingMediaFields({
  registrationUrl,
  setRegistrationUrl,
  coverImageUrl,
  setCoverImageUrl,
  onUploadCoverImage,
  coverUploadStatus,
  coverUploadError,
}: {
  registrationUrl: string;
  setRegistrationUrl: (value: string) => void;
  coverImageUrl: string;
  setCoverImageUrl: (value: string) => void;
  onUploadCoverImage: (file: File) => void;
  coverUploadStatus: "idle" | "uploading" | "uploaded" | "failed";
  coverUploadError: string | null;
}) {
  return (
    <div className="border-t-2 border-zinc-100 pt-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-black text-zinc-700">
            External registration URL (optional)
          </label>
          <input
            value={registrationUrl}
            onChange={(event) => setRegistrationUrl(event.target.value)}
            placeholder="https://..."
            className="h-11 w-full rounded-md border-2 border-zinc-200 px-3 text-sm font-bold focus:border-[#00a7e8] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-black text-zinc-700">
            Cover or logo image
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;

              onUploadCoverImage(file);
            }}
            className="block h-11 w-full rounded-md border-2 border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-950 file:px-3 file:py-1.5 file:text-xs file:font-black file:text-white focus:border-[#00a7e8] focus:outline-none"
          />
          <input
            value={coverImageUrl}
            onChange={(event) => setCoverImageUrl(event.target.value)}
            placeholder="Or paste an image URL"
            className="mt-2 h-10 w-full rounded-md border-2 border-zinc-200 px-3 text-xs font-bold focus:border-[#00a7e8] focus:outline-none"
          />
          {coverUploadStatus !== "idle" ? (
            <p className="mt-1.5 text-xs font-black text-zinc-500">
              {coverUploadStatus === "uploading"
                ? "Uploading cover image..."
                : coverUploadStatus === "uploaded"
                  ? "Cover image uploaded."
                  : coverUploadError ?? "Cover image upload failed."}
            </p>
          ) : null}
        </div>
      </div>
      {coverImageUrl.trim() ? (
        <div
          aria-label="Listing cover preview"
          className="mt-3 h-36 overflow-hidden rounded-lg border-2 border-zinc-200 bg-zinc-50 bg-cover bg-center"
          style={{ backgroundImage: `url(${coverImageUrl})` }}
        />
      ) : null}
    </div>
  );
}
