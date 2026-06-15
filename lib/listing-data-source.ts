type ListingDataSourceInput<T> = {
  convexItems: T[] | undefined;
};

type OrganizerListingDataSourceInput<T> = {
  dashboardItems: T[] | undefined;
};

export function getListingDataSourceItems<T>({
  convexItems,
}: ListingDataSourceInput<T>) {
  return convexItems ?? [];
}

export function getOrganizerListingDataSourceItems<T>({
  dashboardItems,
}: OrganizerListingDataSourceInput<T>) {
  return dashboardItems ?? [];
}

type OptionalRealtimeItemsInput<T> = {
  realtimeItems: T[] | undefined;
};

export function getOptionalRealtimeItems<T>({
  realtimeItems,
}: OptionalRealtimeItemsInput<T>) {
  return realtimeItems ?? [];
}
