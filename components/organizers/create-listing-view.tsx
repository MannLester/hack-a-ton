import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import type { CreateListingStatus } from "@/components/shared/types";
import { FeaturePanel } from "@/components/shared/primitives";
import { CalendarPicker, DateRangePicker } from "@/components/shared/calendar";

const STEP_LABELS = ["Basics", "Location", "Details", "Description", "Review"] as const;

const statusMessages: Record<CreateListingStatus, string> = {
  idle: "",
  "draft-saved": "Draft saved locally for this session.",
  submitted: "Listing submitted for review locally.",
  "missing-fields": "Fill in all required fields before this step.",
};

export function CreateListingView({ onBack }: { onBack: () => void }) {
  const [status, setStatus] = useState<CreateListingStatus>("idle");
  const [currentStep, setCurrentStep] = useState(1);

  const [listingName, setListingName] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [registrationDeadlineLabel, setRegistrationDeadlineLabel] =
    useState("");
  const [setup, setSetup] = useState<"Online" | "Onsite" | "Hybrid" | "">("");
  const [location, setLocation] = useState("");
  const [region, setRegion] = useState<
    "Luzon" | "Visayas" | "Mindanao" | "Philippines-wide" | ""
  >("");
  const [eligibilityText, setEligibilityText] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [prize, setPrize] = useState("");
  const [difficulty, setDifficulty] = useState<
    "Beginner" | "Intermediate" | "Open" | ""
  >("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [description, setDescription] = useState("");

  const eligibility = eligibilityText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const statusMessage = statusMessages[status];

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

  const confirmSubmit = () => setStatus("submitted");

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
            Create a listing for participant discovery
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
              teamSize={teamSize}
              setTeamSize={setTeamSize}
              prize={prize}
              setPrize={setPrize}
              eligibilityText={eligibilityText}
              setEligibilityText={setEligibilityText}
              registrationUrl={registrationUrl}
              setRegistrationUrl={setRegistrationUrl}
            />
          )}
          {currentStep === 4 && (
            <StepDescription
              description={description}
              setDescription={setDescription}
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
              description={description}
            />
          )}
        </div>

        {statusMessage ? (
          <p className="mb-3 text-sm font-black text-red-600">
            {statusMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          {currentStep > 1 && (
            <button
              onClick={goBack}
              className="h-11 rounded-md border-2 border-zinc-950 px-5 text-sm font-black text-zinc-950"
            >
              Back
            </button>
          )}
          {currentStep < 5 && (
            <button
              onClick={goNext}
              className="h-11 rounded-md bg-zinc-950 px-5 text-sm font-black text-white"
            >
              Next
            </button>
          )}
          {currentStep === 5 && (
            <button
              onClick={confirmSubmit}
              className="h-11 rounded-md bg-zinc-950 px-5 text-sm font-black text-white"
            >
              Confirm submit
            </button>
          )}
          <button
            onClick={() => setStatus("draft-saved")}
            className="h-11 rounded-md border-2 border-zinc-950 px-5 text-sm font-black text-zinc-950"
          >
            Save draft
          </button>
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
  teamSize,
  setTeamSize,
  prize,
  setPrize,
  eligibilityText,
  setEligibilityText,
  registrationUrl,
  setRegistrationUrl,
}: {
  difficulty: string;
  setDifficulty: (v: "Beginner" | "Intermediate" | "Open") => void;
  teamSize: string;
  setTeamSize: (v: string) => void;
  prize: string;
  setPrize: (v: string) => void;
  eligibilityText: string;
  setEligibilityText: (v: string) => void;
  registrationUrl: string;
  setRegistrationUrl: (v: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Select
        value={difficulty}
        onChange={setDifficulty as (v: string) => void}
        placeholder="Select difficulty"
        options={["Beginner", "Intermediate", "Open"]}
        label="Difficulty"
      />
      <Input
        value={teamSize}
        onChange={setTeamSize}
        placeholder="e.g., 2-4"
        label="Team size"
      />
      <Input
        value={prize}
        onChange={setPrize}
        placeholder="e.g., PHP 120k pool"
        label="Prize"
      />
      <Input
        value={eligibilityText}
        onChange={setEligibilityText}
        placeholder="e.g., Students, Professionals"
        label="Eligibility (comma-separated)"
      />
      <div className="md:col-span-2">
        <Input
          value={registrationUrl}
          onChange={setRegistrationUrl}
          placeholder="https://..."
          label="External registration URL (optional)"
        />
      </div>
    </div>
  );
}

function StepDescription({
  description,
  setDescription,
}: {
  description: string;
  setDescription: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black text-zinc-700">
        Description
      </label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="min-h-40 w-full rounded-md border-2 border-zinc-200 p-3 text-sm font-bold focus:border-[#00a7e8] focus:outline-none"
        placeholder="Describe the hackathon, eligibility, team size, prizes, and schedule"
      />
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
  description: string;
}) {
  return (
    <div className="space-y-3 text-sm">
      <p className="mb-4 text-xs font-black text-zinc-500">
        Please confirm all details before submitting.
      </p>
      <ReviewRow label="Hackathon name" value={listingName} />
      <ReviewRow label="Organizer" value={organizerName} />
      <ReviewRow label="Date" value={dateLabel} />
      <ReviewRow label="Registration deadline" value={registrationDeadlineLabel} />
      <ReviewRow label="Setup" value={setup} />
      <ReviewRow label="Location" value={location} />
      <ReviewRow label="Region" value={region} />
      <ReviewRow label="Team size" value={teamSize} />
      <ReviewRow label="Prize" value={prize} />
      <ReviewRow label="Difficulty" value={difficulty} />
      {eligibility.length > 0 && (
        <ReviewRow label="Eligibility" value={eligibility.join(", ")} />
      )}
      {registrationUrl.trim() && (
        <ReviewRow label="Registration URL" value={registrationUrl} />
      )}
      <div>
        <p className="text-xs font-black text-zinc-500">Description</p>
        <p className="mt-1 whitespace-pre-wrap font-bold text-zinc-950">
          {description}
        </p>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <p className="w-40 shrink-0 text-xs font-black text-zinc-500">
        {label}
      </p>
      <p className="font-bold text-zinc-950">{value}</p>
    </div>
  );
}
