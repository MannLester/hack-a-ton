import { describe, expect, test } from "vitest";
import {
  getListingDataSourceItems,
  getOptionalRealtimeItems,
  getOrganizerListingDataSourceItems,
} from "../lib/listing-data-source";

describe("listing data source policy", () => {
  test("uses Convex listings when Convex has returned real data", () => {
    expect(
      getListingDataSourceItems({
        isConvexEnabled: true,
        convexItems: ["remote listing"],
        fallbackItems: ["sample listing"],
      }),
    ).toEqual(["remote listing"]);
  });

  test("does not fall back to sample listings when Convex returns an empty list", () => {
    expect(
      getListingDataSourceItems({
        isConvexEnabled: true,
        convexItems: [],
        fallbackItems: ["sample listing"],
      }),
    ).toEqual([]);
  });

  test("uses sample listings only when Convex is unavailable", () => {
    expect(
      getListingDataSourceItems({
        isConvexEnabled: false,
        convexItems: undefined,
        fallbackItems: ["sample listing"],
      }),
    ).toEqual(["sample listing"]);
  });

  test("keeps organizer listings empty while Convex dashboard data is loading", () => {
    expect(
      getOrganizerListingDataSourceItems({
        isConvexEnabled: true,
        dashboardItems: undefined,
        fallbackItems: ["sample listing"],
      }),
    ).toEqual([]);
  });

  test("keeps realtime engagement lists empty while Convex data is loading", () => {
    expect(
      getOptionalRealtimeItems({
        isConvexEnabled: true,
        realtimeItems: undefined,
        fallbackItems: ["sample team"],
      }),
    ).toEqual([]);
  });

  test("allows explicit demo fallbacks for engagement lists when Convex is unavailable", () => {
    expect(
      getOptionalRealtimeItems({
        isConvexEnabled: false,
        realtimeItems: undefined,
        fallbackItems: ["sample team"],
      }),
    ).toEqual(["sample team"]);
  });
});
