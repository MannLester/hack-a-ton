import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  FileText,
  Link,
  MapPin,
  Trophy,
} from "lucide-react";
import type {
  CreateListingFormValues,
  CreateListingStatus,
} from "@/components/shared/types";
import { FeaturePanel, statusClass } from "@/components/shared/primitives";
import { CalendarPicker, DateRangePicker } from "@/components/shared/calendar";
import {
  canSaveOrganizerDraft,
  canSubmitOrganizerListing,
  getListingDateValidationMessage,
  getListingQualityChecks,
} from "@/lib/organizer-workflow";
import { validateCoverImageFile } from "@/lib/cover-image-upload";
import { useListingAutosave } from "@/components/organizers/use-listing-autosave";
import { ListingMediaFields } from "@/components/organizers/listing-media-fields";

const STEP_LABELS = ["Basics", "Location", "Details", "Description", "Review"] as const;

const ELIGIBILITY_OPTIONS = [
  "Students",
  "Professionals",
  "Beginner-friendly",
  "Open to all",
  "Open to all schools",
] as const;

const statusMessages: Record<CreateListingStatus, string> = {
  idle: "",
  saving: "Saving draft...",
  submitting: "Submitting listing...",
  "draft-saved": "Draft saved to the organizer workspace.",
  submitted: "Listing submitted for review.",
  "missing-fields": "Fill in all required fields before this step.",
  failed: "Something went wrong. Check the listing details and try again.",
};

type CreateListingViewProps = {
  initialValues?: CreateListingFormValues;
  onBack: () => void;
  onSaveDraft?: (values: CreateListingFormValues) => Promise<CreateListingFormValues["listingId"] | void> | CreateListingFormValues["listingId"] | void;
  onSubmitForReview?: (values: CreateListingFormValues) => Promise<void> | void;
  onRemoteAutosave?: (values: CreateListingFormValues) => Promise<CreateListingFormValues["listingId"] | void> | CreateListingFormValues["listingId"] | void;
  onUploadCoverImage?: (file: File) => Promise<{ storageId: NonNullable<CreateListingFormValues["coverImageStorageId"]>; previewUrl: string }>;
};

function getEligibilityText(selectedEligibility: string[], eligibilityText: string) {
  return selectedEligibility.length > 0
    ? selectedEligibility.join(", ")
    : eligibilityText;
}

function getStatusMessageClass(status: CreateListingStatus) {
  if (status === "failed" || status === "missing-fields") {
    return "text-red-600";
  }

  if (status === "draft-saved" || status === "submitted") {
    return "text-emerald-700";
  }

  return "text-zinc-600";
}

export function CreateListingView({
  initialValues,
  onBack,
  onSaveDraft,
  onSubmitForReview,
  onRemoteAutosave,
  onUploadCoverImage,
}: CreateListingViewProps) {
  const [status, setStatus] = useState<CreateListingStatus>("idle");
  const [currentStep, setCurrentStep] = useState(1);
  const [persistedListingId, setPersistedListingId] = useState(initialValues?.listingId);
  const [remoteAutosaveLabel, setRemoteAutosaveLabel] = useState<string | null>(null);
  const [coverUploadStatus, setCoverUploadStatus] = useState<"idle" | "uploading" | "uploaded" | "failed">("idle");
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);

  const [listingName, setListingName] = useState(initialValues?.listingName ?? "");
  const [organizerName, setOrganizerName] = useState(initialValues?.organizerName ?? "");
  const [dateLabel, setDateLabel] = useState(initialValues?.dateLabel ?? "");
  const [registrationDeadlineLabel, setRegistrationDeadlineLabel] =
    useState(initialValues?.registrationDeadlineLabel ?? "");
  const [setup, setSetup] = useState<"Online" | "Onsite" | "Hybrid" | "">(initialValues?.setup ?? "");
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [region, setRegion] = useState<
    "Luzon" | "Visayas" | "Mindanao" | "Philippines-wide" | ""
  >(initialValues?.region ?? "");
  const [eligibilityText, setEligibilityText] = useState(initialValues?.eligibilityText ?? "");
  const [teamSize, setTeamSize] = useState(initialValues?.teamSize ?? "");
  const [prize, setPrize] = useState(initialValues?.prize ?? "");
  const [difficulty, setDifficulty] = useState<
    "Beginner" | "Intermediate" | "Open" | ""
  >(initialValues?.difficulty ?? "");
  const [registrationUrl, setRegistrationUrl] = useState(initialValues?.registrationUrl ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialValues?.coverImageUrl ?? "");
  const [coverImageStorageId, setCoverImageStorageId] = useState(initialValues?.coverImageStorageId);
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [teamSizeMin, setTeamSizeMin] = useState(initialValues?.teamSize.split("-")[0] ?? "");
  const [teamSizeMax, setTeamSizeMax] = useState(initialValues?.teamSize.split("-")[1] ?? "");
  const [selectedEligibility, setSelectedEligibility] = useState<string[]>(
    initialValues?.eligibilityText
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean) ?? [],
  );

  const eligibility = eligibilityText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const updateTeamSize = (min: string, max: string) => {
    setTeamSizeMin(min);
    setTeamSizeMax(max);
    if (min && max) {
      setTeamSize(`${min}-${max}`);
    } else if (min) {
      setTeamSize(min);
    } else {
      setTeamSize("");
    }
  };

  const toggleEligibility = (option: string) => {
    setSelectedEligibility((prev) => {
      const next = prev.includes(option)
        ? prev.filter((v) => v !== option)
        : [...prev, option];
      setEligibilityText(next.join(", "));
      return next;
    });
  };

  const isActiveListingEdit =
    initialValues?.listingStatus === "Open" ||
    initialValues?.listingStatus === "Upcoming" ||
    initialValues?.listingStatus === "Happening now";
  const formValues = getFormValues();
  const dateValidationMessage = getListingDateValidationMessage(formValues);
  const statusMessage = statusMessages[status];
  const isBusy = status === "saving" || status === "submitting";
  const isSubmitted = status === "submitted";

  const isStepValid = (step: number): boolean => {
    if (step === 1) {
      return (
        !!listingName.trim() &&
        !!organizerName.trim() &&
        !!dateLabel.trim() &&
        !!registrationDeadlineLabel.trim()
      );
    }
    if (step === 2) {
      return !!location.trim() && setup !== "" && region !== "";
    }
    if (step === 3) {
      return !!teamSize.trim() && !!prize.trim() && difficulty !== "";
    }
    if (step === 4) {
      return !!description.trim();
    }
    return true;
  };

  function getFormValues(): CreateListingFormValues {
    return {
      listingName,
      organizerName,
      dateLabel,
      registrationDeadlineLabel,
      setup: setup || "Hybrid",
      location,
      region: region || "Philippines-wide",
      eligibilityText: getEligibilityText(selectedEligibility, eligibilityText),
      teamSize,
      prize,
      difficulty: difficulty || "Open",
      registrationUrl,
      coverImageUrl,
      coverImageStorageId,
      description,
    };
  }

  const getPersistableValues = (): CreateListingFormValues => ({
    ...getFormValues(),
    listingId: persistedListingId,
  });

  const restoreAutosavedValues = useCallback((values: CreateListingFormValues) => {
    setListingName(values.listingName);
    setOrganizerName(values.organizerName);
    setDateLabel(values.dateLabel);
    setRegistrationDeadlineLabel(values.registrationDeadlineLabel);
    setSetup(values.setup);
    setLocation(values.location);
    setRegion(values.region);
    setEligibilityText(values.eligibilityText);
    setTeamSize(values.teamSize);
    setPrize(values.prize);
    setDifficulty(values.difficulty);
    setRegistrationUrl(values.registrationUrl);
    setCoverImageUrl(values.coverImageUrl);
    setCoverImageStorageId(values.coverImageStorageId);
    setDescription(values.description);
    setTeamSizeMin(values.teamSize.split("-")[0] ?? "");
    setTeamSizeMax(values.teamSize.split("-")[1] ?? "");
    setSelectedEligibility(
      values.eligibilityText
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    );
  }, []);

  const { autosaveLabel, clearAutosave } = useListingAutosave({
    listingId: persistedListingId,
    values: getPersistableValues(),
    onRestore: restoreAutosavedValues,
  });

  const canPersistListing = () => canSubmitOrganizerListing(getFormValues());

  const savePersistedListingId = (listingId: CreateListingFormValues["listingId"] | void) => {
    if (!listingId) return;

    setPersistedListingId(listingId);
  };


  useEffect(() => {
    if (!onRemoteAutosave) return;
    if (isSubmitted || isBusy || isActiveListingEdit) return;

    const values: CreateListingFormValues = {
      listingId: persistedListingId,
      listingName,
      organizerName,
      dateLabel,
      registrationDeadlineLabel,
      setup: setup || "Hybrid",
      location,
      region: region || "Philippines-wide",
      eligibilityText: getEligibilityText(selectedEligibility, eligibilityText),
      teamSize,
      prize,
      difficulty: difficulty || "Open",
      registrationUrl,
      coverImageUrl,
      coverImageStorageId,
      description,
    };

    if (!canSaveOrganizerDraft(values)) return;

    const timeoutId = window.setTimeout(() => {
      Promise.resolve(onRemoteAutosave(values))
        .then((listingId) => {
          savePersistedListingId(listingId);
          setRemoteAutosaveLabel(
            new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          );
        })
        .catch(() => setRemoteAutosaveLabel(null));
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [
    coverImageStorageId,
    coverImageUrl,
    dateLabel,
    description,
    difficulty,
    eligibilityText,
    isActiveListingEdit,
    isBusy,
    isSubmitted,
    listingName,
    location,
    onRemoteAutosave,
    organizerName,
    persistedListingId,
    prize,
    region,
    registrationDeadlineLabel,
    registrationUrl,
    selectedEligibility,
    setup,
    teamSize,
  ]);

  const updateCoverImageUrl = (url: string) => {
    setCoverImageStorageId(undefined);
    setCoverUploadStatus("idle");
    setCoverUploadError(null);
    setCoverImageUrl(url);
  };

  const uploadCoverImage = (file: File) => {
    if (!onUploadCoverImage) return;

    const validation = validateCoverImageFile(file);

    if (!validation.isValid) {
      setCoverUploadStatus("failed");
      setCoverUploadError(validation.message);
      return;
    }

    setCoverUploadStatus("uploading");
    setCoverUploadError(null);
    Promise.resolve(onUploadCoverImage(file))
      .then(({ storageId, previewUrl }) => {
        setCoverImageStorageId(storageId);
        setCoverImageUrl(previewUrl);
        setCoverUploadStatus("uploaded");
      })
      .catch(() => {
        setCoverUploadStatus("failed");
        setCoverUploadError("Cover image upload failed.");
      });
  };

  const goNext = () => {
    if (!isStepValid(currentStep)) {
      setStatus("missing-fields");
      return;
    }
    setStatus("idle");
    setCurrentStep((s) => Math.min(s + 1, 5));
  };

  const goBack = () => {
    setStatus("idle");
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const saveDraft = () => {
    if (isSubmitted) return;

    const values = getPersistableValues();

    if (!canSaveOrganizerDraft(values)) {
      setStatus("missing-fields");
      return;
    }

    setStatus("saving");
    Promise.resolve(onSaveDraft?.(values))
      .then((listingId) => {
        savePersistedListingId(listingId);
        clearAutosave();
        setStatus("draft-saved");
      })
      .catch(() => setStatus("failed"));
  };

  const confirmSubmit = () => {
    if (isSubmitted) return;

    const values = getPersistableValues();

    if (!canSubmitOrganizerListing(values)) {
      setStatus("missing-fields");
      return;
    }

    const dateValidationMessage = getListingDateValidationMessage(values);

    if (dateValidationMessage) {
      setStatus("missing-fields");
      return;
    }

    setStatus("submitting");
    Promise.resolve(onSubmitForReview?.(values))
      .then(() => {
        clearAutosave();
        setStatus("submitted");
      })
      .catch(() => setStatus("failed"));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5">
        <button
          onClick={onBack}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-zinc-950 bg-white text-zinc-800 shadow-[3px_3px_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#111]"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00a7e8]">
            Organizer mode
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
            {initialValues ? "Edit your hackathon listing" : "Create a listing for participant discovery"}
          </h2>
          <div className="mt-2 h-1 w-16 rounded-full bg-[#00a7e8]" />
        </div>
      </div>

      <ProgressBar currentStep={currentStep} />

      <FeaturePanel className="p-5">
        <div className="min-h-[280px]">
          {currentStep === 1 && (
            <StepBasics
              listingName={listingName}
              setListingName={setListingName}
              organizerName={organizerName}
              setOrganizerName={setOrganizerName}
              dateLabel={dateLabel}
              setDateLabel={setDateLabel}
              registrationDeadlineLabel={registrationDeadlineLabel}
              setRegistrationDeadlineLabel={setRegistrationDeadlineLabel}
            />
          )}
          {currentStep === 2 && (
            <StepLocation
              setup={setup}
              setSetup={setSetup}
              location={location}
              setLocation={setLocation}
              region={region}
              setRegion={setRegion}
            />
          )}
          {currentStep === 3 && (
            <StepDetails
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              teamSizeMin={teamSizeMin}
              teamSizeMax={teamSizeMax}
              onUpdateTeamSize={updateTeamSize}
              prize={prize}
              setPrize={setPrize}
              selectedEligibility={selectedEligibility}
              toggleEligibility={toggleEligibility}
              registrationUrl={registrationUrl}
              setRegistrationUrl={setRegistrationUrl}
              coverImageUrl={coverImageUrl}
              setCoverImageUrl={updateCoverImageUrl}
              onUploadCoverImage={uploadCoverImage}
              coverUploadStatus={coverUploadStatus}
              coverUploadError={coverUploadError}
            />
          )}
          {currentStep === 4 && (
            <StepDescription
              description={description}
              setDescription={setDescription}
              qualityChecks={getListingQualityChecks(getFormValues())}
            />
          )}
          {currentStep === 5 && (
            <StepReview
              listingName={listingName}
              organizerName={organizerName}
              dateLabel={dateLabel}
              registrationDeadlineLabel={registrationDeadlineLabel}
              setup={setup}
              location={location}
              region={region}
              teamSize={teamSize}
              prize={prize}
              difficulty={difficulty}
              eligibility={eligibility}
              registrationUrl={registrationUrl}
              coverImageUrl={coverImageUrl}
              description={description}
            />
          )}
        </div>

        {autosaveLabel ? (
          <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
            {remoteAutosaveLabel ? `Remote autosaved ${remoteAutosaveLabel}` : autosaveLabel}
          </p>
        ) : null}

        {dateValidationMessage ? (
          <p className="mb-3 text-sm font-black text-red-600">
            {dateValidationMessage}
          </p>
        ) : null}

        {statusMessage ? (
          <p className={`mb-3 text-sm font-black ${getStatusMessageClass(status)}`}>
            {statusMessage}
          </p>
        ) : null}

        {status === "draft-saved" ? (
          <ConfirmationPanel
            title={isActiveListingEdit ? "Changes saved" : "Draft saved"}
            body={
              isActiveListingEdit
                ? "Participants will see that this listing was updated by the organizer."
                : "You can keep editing now or return to your organizer listings."
            }
            actionLabel="Back to listings"
            onAction={onBack}
          />
        ) : null}

        {status === "submitted" ? (
          <ConfirmationPanel
            title="Submitted for review"
            body="Your listing is now pending review. If staff requests edits, the note will appear beside the listing in your organizer dashboard."
            actionLabel="Back to listings"
            onAction={onBack}
          />
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {currentStep > 1 && (
            <button
              onClick={goBack}
              disabled={isBusy}
              className="h-11 rounded-md border-2 border-zinc-950 px-5 text-sm font-black text-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:text-zinc-400"
            >
              Back
            </button>
          )}
          {currentStep < 5 && (
            <button
              onClick={goNext}
              disabled={isBusy}
              className="h-11 rounded-md bg-zinc-950 px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              Next
            </button>
          )}
          {currentStep === 5 && !isActiveListingEdit && !isSubmitted && (
            <button
              onClick={confirmSubmit}
              disabled={isBusy}
              className="h-11 rounded-md bg-zinc-950 px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              Confirm submit
            </button>
          )}
          {!isSubmitted ? (
          <button
            onClick={saveDraft}
            disabled={isBusy}
            className="h-11 rounded-md border-2 border-zinc-950 px-5 text-sm font-black text-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:text-zinc-400"
          >
            {isActiveListingEdit ? "Save changes" : "Save draft"}
          </button>
          ) : null}
        </div>
      </FeaturePanel>
    </div>
  );
}

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center px-4">
      {STEP_LABELS.map((label, index) => {
        const step = index + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex size-9 items-center justify-center rounded-full border-2 text-sm font-black transition-colors ${
                  isCompleted || isCurrent
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-300 bg-white text-zinc-400"
                }`}
              >
                {isCompleted ? <Check className="size-4" /> : step}
              </div>
              <span
                className={`whitespace-nowrap text-xs font-black ${
                  isCurrent
                    ? "text-zinc-950"
                    : isCompleted
                      ? "text-zinc-600"
                      : "text-zinc-400"
                }`}
              >
                {label}
              </span>
            </div>
            {index < STEP_LABELS.length - 1 && (
              <div
                className={`mx-2 mb-5 h-0.5 w-8 sm:w-12 ${
                  step < currentStep ? "bg-zinc-950" : "bg-zinc-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label?: string;
}) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-xs font-black text-zinc-700">
          {label}
        </label>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-md border-2 border-zinc-200 px-3 text-sm font-bold focus:border-[#00a7e8] focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}

function Select({
  value,
  onChange,
  placeholder,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  label?: string;
}) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-xs font-black text-zinc-700">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-md border-2 border-zinc-200 bg-white pl-3 pr-10 text-sm font-bold focus:border-[#00a7e8] focus:outline-none"
      >
        <option disabled value="">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function StepBasics({
  listingName,
  setListingName,
  organizerName,
  setOrganizerName,
  dateLabel,
  setDateLabel,
  registrationDeadlineLabel,
  setRegistrationDeadlineLabel,
}: {
  listingName: string;
  setListingName: (v: string) => void;
  organizerName: string;
  setOrganizerName: (v: string) => void;
  dateLabel: string;
  setDateLabel: (v: string) => void;
  registrationDeadlineLabel: string;
  setRegistrationDeadlineLabel: (v: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input
        value={listingName}
        onChange={setListingName}
        placeholder="e.g., PH AI Build Weekend"
        label="Hackathon name"
      />
      <Input
        value={organizerName}
        onChange={setOrganizerName}
        placeholder="e.g., DevCon Manila"
        label="Organizer name"
      />
      <DateRangePicker
        value={dateLabel}
        onChange={setDateLabel}
        label="Event dates"
      />
      <CalendarPicker
        value={registrationDeadlineLabel.replace(/^Closes\s*/, "")}
        onChange={(v) => setRegistrationDeadlineLabel(`Closes ${v}`)}
        label="Registration deadline"
        placeholder="Pick deadline date"
      />
    </div>
  );
}

function StepLocation({
  setup,
  setSetup,
  location,
  setLocation,
  region,
  setRegion,
}: {
  setup: string;
  setSetup: (v: "Online" | "Onsite" | "Hybrid") => void;
  location: string;
  setLocation: (v: string) => void;
  region: string;
  setRegion: (
    v: "Luzon" | "Visayas" | "Mindanao" | "Philippines-wide",
  ) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Select
        value={setup}
        onChange={setSetup as (v: string) => void}
        placeholder="Select setup"
        options={["Online", "Onsite", "Hybrid"]}
        label="Setup"
      />
      <Input
        value={location}
        onChange={setLocation}
        placeholder="e.g., BGC, Taguig"
        label="Location"
      />
      <Select
        value={region}
        onChange={setRegion as (v: string) => void}
        placeholder="Select region"
        options={["Luzon", "Visayas", "Mindanao", "Philippines-wide"]}
        label="Region"
      />
    </div>
  );
}

function StepDetails({
  difficulty,
  setDifficulty,
  teamSizeMin,
  teamSizeMax,
  onUpdateTeamSize,
  prize,
  setPrize,
  selectedEligibility,
  toggleEligibility,
  registrationUrl,
  setRegistrationUrl,
  coverImageUrl,
  setCoverImageUrl,
  onUploadCoverImage,
  coverUploadStatus,
  coverUploadError,
}: {
  difficulty: string;
  setDifficulty: (v: "Beginner" | "Intermediate" | "Open") => void;
  teamSizeMin: string;
  teamSizeMax: string;
  onUpdateTeamSize: (min: string, max: string) => void;
  prize: string;
  setPrize: (v: string) => void;
  selectedEligibility: string[];
  toggleEligibility: (option: string) => void;
  registrationUrl: string;
  setRegistrationUrl: (v: string) => void;
  coverImageUrl: string;
  setCoverImageUrl: (v: string) => void;
  onUploadCoverImage: (file: File) => void;
  coverUploadStatus: "idle" | "uploading" | "uploaded" | "failed";
  coverUploadError: string | null;
}) {
  const numberOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const maxOptions = numberOptions.filter(
    (n) => !teamSizeMin || Number(n) >= Number(teamSizeMin),
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          value={difficulty}
          onChange={setDifficulty as (v: string) => void}
          placeholder="Select difficulty"
          options={["Beginner", "Intermediate", "Open"]}
          label="Difficulty"
        />
        <div>
          <label className="mb-1.5 block text-xs font-black text-zinc-700">
            Team size
          </label>
          <div className="flex items-center gap-2">
            <select
              value={teamSizeMin}
              onChange={(e) =>
                onUpdateTeamSize(e.target.value, teamSizeMax)
              }
              className="h-11 flex-1 rounded-md border-2 border-zinc-200 bg-white px-3 text-sm font-bold focus:border-[#00a7e8] focus:outline-none"
            >
              <option disabled value="">
                Min
              </option>
              {numberOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-sm font-black text-zinc-400">—</span>
            <select
              value={teamSizeMax}
              onChange={(e) =>
                onUpdateTeamSize(teamSizeMin, e.target.value)
              }
              className="h-11 flex-1 rounded-md border-2 border-zinc-200 bg-white px-3 text-sm font-bold focus:border-[#00a7e8] focus:outline-none"
            >
              <option disabled value="">
                Max
              </option>
              {maxOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <Input
        value={prize}
        onChange={setPrize}
        placeholder="e.g., PHP 120k pool"
        label="Prize"
      />
      <div className="border-t-2 border-zinc-100 pt-4">
        <label className="mb-1.5 block text-xs font-black text-zinc-700">
          Eligibility
        </label>
        <div className="flex flex-wrap gap-2">
          {ELIGIBILITY_OPTIONS.map((option) => {
            const isSelected = selectedEligibility.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleEligibility(option)}
                className={`rounded-md px-3 py-1.5 text-xs font-black transition-colors ${
                  isSelected
                    ? "bg-zinc-950 text-white"
                    : "border-2 border-zinc-200 text-zinc-600 hover:border-zinc-400"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
      <ListingMediaFields
        registrationUrl={registrationUrl}
        setRegistrationUrl={setRegistrationUrl}
        coverImageUrl={coverImageUrl}
        setCoverImageUrl={setCoverImageUrl}
        onUploadCoverImage={onUploadCoverImage}
        coverUploadStatus={coverUploadStatus}
        coverUploadError={coverUploadError}
      />
    </div>
  );
}

function StepDescription({
  description,
  setDescription,
  qualityChecks,
}: {
  description: string;
  setDescription: (v: string) => void;
  qualityChecks: { label: string; isComplete: boolean }[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div>
        <label className="mb-1.5 block text-xs font-black text-zinc-700">
          Listing description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-56 w-full rounded-md border-2 border-zinc-200 p-3 text-sm font-bold leading-6 focus:border-[#00a7e8] focus:outline-none"
          placeholder="Explain the theme, who should join, schedule, judging criteria, deliverables, and contact channel."
        />
      </div>
      <div className="rounded-lg border-2 border-zinc-200 bg-zinc-50 p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
          Quality checklist
        </p>
        <div className="mt-3 space-y-2">
          {qualityChecks.map((check) => (
            <div key={check.label} className="flex items-center gap-2 text-sm font-bold">
              <span
                className={`grid size-5 place-items-center rounded-full border text-[10px] ${
                  check.isComplete
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-zinc-300 bg-white text-zinc-400"
                }`}
              >
                {check.isComplete ? "✓" : ""}
              </span>
              <span className={check.isComplete ? "text-zinc-800" : "text-zinc-500"}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfirmationPanel({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="mb-4 rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4">
      <p className="font-black text-emerald-900">{title}</p>
      <p className="mt-1 text-sm font-bold leading-6 text-emerald-800">{body}</p>
      <button
        onClick={onAction}
        className="mt-3 h-10 rounded-md bg-emerald-700 px-4 text-sm font-black text-white"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function StepReview({
  listingName,
  organizerName,
  dateLabel,
  registrationDeadlineLabel,
  setup,
  location,
  region,
  teamSize,
  prize,
  difficulty,
  eligibility,
  registrationUrl,
  coverImageUrl,
  description,
}: {
  listingName: string;
  organizerName: string;
  dateLabel: string;
  registrationDeadlineLabel: string;
  setup: string;
  location: string;
  region: string;
  teamSize: string;
  prize: string;
  difficulty: string;
  eligibility: string[];
  registrationUrl: string;
  coverImageUrl: string;
  description: string;
}) {
  const previewTags = [setup, region, difficulty].filter(Boolean);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        <div className="rounded-lg border-2 border-zinc-950 bg-zinc-950 px-5 py-4">
          <h3 className="text-xl font-black text-white">{listingName}</h3>
          <p className="mt-1 text-sm font-bold text-zinc-300">{organizerName}</p>
        </div>

      <ReviewSection title="Schedule" icon={CalendarDays}>
        <ReviewRow label="Event dates" value={dateLabel} />
        <ReviewRow label="Registration deadline" value={registrationDeadlineLabel} />
      </ReviewSection>

      <ReviewSection title="Location" icon={MapPin}>
        <ReviewRow label="Setup" value={setup} />
        <ReviewRow label="Location" value={location} />
        <ReviewRow label="Region" value={region} />
      </ReviewSection>

      <ReviewSection title="Details" icon={Trophy}>
        <ReviewRow label="Team size" value={teamSize} />
        <ReviewRow label="Prize" value={prize} />
        <ReviewRow label="Difficulty" value={difficulty} />
        {eligibility.length > 0 && (
          <div className="py-2">
            <p className="text-xs font-black text-zinc-500">Eligibility</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {eligibility.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border-2 border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-black text-zinc-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </ReviewSection>

      {registrationUrl.trim() && (
        <ReviewSection title="External" icon={Link}>
          <ReviewRow label="Registration URL" value={registrationUrl} />
        </ReviewSection>
      )}

        <ReviewSection title="Description" icon={FileText}>
          <p className="whitespace-pre-wrap py-2 text-sm leading-6 text-zinc-700">
            {description}
          </p>
        </ReviewSection>
      </div>
      <div className="h-fit rounded-lg border-2 border-zinc-950 bg-white p-4 shadow-[4px_4px_0_#111]">
        {coverImageUrl.trim() ? (
          <div
            aria-label="Listing cover preview"
            className="mb-4 h-32 w-full rounded-md border-2 border-zinc-200 bg-cover bg-center"
            style={{ backgroundImage: `url(${coverImageUrl})` }}
          />
        ) : null}
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#00a7e8]">
          Participant preview
        </p>
        <h3 className="mt-2 text-xl font-black text-zinc-950">
          {listingName || "Untitled hackathon"}
        </h3>
        <p className="mt-1 text-sm font-bold text-zinc-500">
          {organizerName || "Organizer"} · {dateLabel || "Date TBA"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {previewTags.map((label) => (
            <span
              key={label}
              className={`rounded-full border px-2.5 py-1 text-xs font-black ${statusClass("Open")}`}
            >
              {label}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm font-bold leading-6 text-zinc-700">
          {description || "Your listing description will appear here for participants."}
        </p>
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Trophy;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border-2 border-zinc-200 bg-white">
      <div className="flex items-center gap-2 border-b-2 border-zinc-100 px-4 py-2.5">
        <Icon className="size-4 text-[#00a7e8]" />
        <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
          {title}
        </p>
      </div>
      <div className="divide-y-2 divide-zinc-100 px-4">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-4 py-2">
      <p className="w-40 shrink-0 text-xs font-black text-zinc-500">
        {label}
      </p>
      <p className="text-sm font-bold text-zinc-950">{value}</p>
    </div>
  );
}
