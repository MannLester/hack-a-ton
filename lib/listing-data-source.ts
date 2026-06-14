type ListingDataSourceInput<T> = {
  isConvexEnabled: boolean;
  convexItems: T[] | undefined;
  fallbackItems: T[];
};

type OrganizerListingDataSourceInput<T> = {
  isConvexEnabled: boolean;
  dashboardItems: T[] | undefined;
  fallbackItems: T[];
};

export function getListingDataSourceItems<T>({
  isConvexEnabled,
  convexItems,
  fallbackItems,
}: ListingDataSourceInput<T>) {
  if (!isConvexEnabled) return fallbackItems;

  return convexItems ?? [];
}

export function getOrganizerListingDataSourceItems<T>({
  isConvexEnabled,
  dashboardItems,
  fallbackItems,
}: OrganizerListingDataSourceInput<T>) {
  if (!isConvexEnabled) return fallbackItems;

  return dashboardItems ?? [];
}


type OptionalRealtimeItemsInput<T> = {
  isConvexEnabled: boolean;
  realtimeItems: T[] | undefined;
  fallbackItems: T[];
};

export function getOptionalRealtimeItems<T>({
  isConvexEnabled,
  realtimeItems,
  fallbackItems,
}: OptionalRealtimeItemsInput<T>) {
  if (!isConvexEnabled) return fallbackItems;

  return realtimeItems ?? [];
}
