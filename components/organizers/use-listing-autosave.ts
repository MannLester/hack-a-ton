import { useEffect, useMemo, useState } from "react";
import type { CreateListingFormValues } from "@/components/shared/types";
import {
  canSaveOrganizerDraft,
  getAutosaveStorageKey,
} from "@/lib/organizer-workflow";

type ListingAutosaveOptions = {
  listingId?: string;
  values: CreateListingFormValues;
  onRestore: (values: CreateListingFormValues) => void;
};

export function useListingAutosave({
  listingId,
  values,
  onRestore,
}: ListingAutosaveOptions) {
  const [hasRestored, setHasRestored] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const storageKey = useMemo(() => getAutosaveStorageKey(listingId), [listingId]);

  useEffect(() => {
    const storedValues = window.localStorage.getItem(storageKey);

    if (storedValues) {
      onRestore(JSON.parse(storedValues) as CreateListingFormValues);
    }

    setHasRestored(true);
  }, [onRestore, storageKey]);

  useEffect(() => {
    if (!hasRestored || !canSaveOrganizerDraft(values)) return;

    const timeoutId = window.setTimeout(() => {
      window.localStorage.setItem(storageKey, JSON.stringify(values));
      setLastSavedAt(new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }));
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [hasRestored, storageKey, values]);

  const clearAutosave = () => {
    window.localStorage.removeItem(storageKey);
    setLastSavedAt(null);
  };

  return {
    autosaveLabel: lastSavedAt ? `Autosaved ${lastSavedAt}` : null,
    clearAutosave,
  };
}
