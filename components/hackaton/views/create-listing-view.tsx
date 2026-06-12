import { useState } from "react";
import type { CreateListingStatus } from "../types";
import { FeaturePanel, SectionTitle } from "../ui";

const statusMessages: Record<CreateListingStatus, string> = {
  idle: "",
  "draft-saved": "Draft saved locally for this session.",
  submitted: "Listing submitted for review locally.",
  "missing-fields": "Fill in all fields before submitting.",
};

export function CreateListingView() {
  const [status, setStatus] = useState<CreateListingStatus>("idle");
  const [listingName, setListingName] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [locationFormat, setLocationFormat] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [description, setDescription] = useState("");
  const hasRequiredFields =
    listingName.trim() &&
    organizerName.trim() &&
    locationFormat.trim() &&
    registrationUrl.trim() &&
    description.trim();
  const statusMessage = statusMessages[status];
  const submitForReview = () =>
    setStatus(hasRequiredFields ? "submitted" : "missing-fields");

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Organizer mode"
        title="Create a listing for participant discovery"
      />
      <FeaturePanel className="p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={listingName}
            onChange={(event) => setListingName(event.target.value)}
            className="h-11 rounded-md border-2 border-zinc-200 px-3 text-sm font-bold"
            placeholder="Hackathon name"
          />
          <input
            value={organizerName}
            onChange={(event) => setOrganizerName(event.target.value)}
            className="h-11 rounded-md border-2 border-zinc-200 px-3 text-sm font-bold"
            placeholder="Organizer name"
          />
          <input
            value={locationFormat}
            onChange={(event) => setLocationFormat(event.target.value)}
            className="h-11 rounded-md border-2 border-zinc-200 px-3 text-sm font-bold"
            placeholder="Location / format"
          />
          <input
            value={registrationUrl}
            onChange={(event) => setRegistrationUrl(event.target.value)}
            className="h-11 rounded-md border-2 border-zinc-200 px-3 text-sm font-bold"
            placeholder="External registration URL"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-32 rounded-md border-2 border-zinc-200 p-3 text-sm font-bold md:col-span-2"
            placeholder="Describe the hackathon, eligibility, team size, prizes, and schedule"
          />
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={submitForReview}
            className="h-11 rounded-md bg-zinc-950 px-5 text-sm font-black text-white"
          >
            Submit for review
          </button>
          <button
            onClick={() => setStatus("draft-saved")}
            className="h-11 rounded-md border-2 border-zinc-950 px-5 text-sm font-black text-zinc-950"
          >
            Save draft
          </button>
        </div>
        {statusMessage ? (
          <p className="mt-4 text-sm font-black text-zinc-600">
            {statusMessage}
          </p>
        ) : null}
      </FeaturePanel>
    </div>
  );
}
