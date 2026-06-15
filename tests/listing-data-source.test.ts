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
        convexItems: ["remote listing"],
      }),
    ).toEqual(["remote listing"]);
  });

  test("does not fall back to sample listings when Convex returns an empty list", () => {
    expect(
      getListingDataSourceItems({
        convexItems: [],
      }),
    ).toEqual([]);
  });

  test("does not use sample listings when Convex is unavailable", () => {
    expect(
      getListingDataSourceItems({
        convexItems: undefined,
      }),
    ).toEqual([]);
  });

  test("keeps organizer listings empty while Convex dashboard data is loading", () => {
    expect(
      getOrganizerListingDataSourceItems({
        dashboardItems: undefined,
      }),
    ).toEqual([]);
  });

  test("keeps realtime engagement lists empty while Convex data is loading", () => {
    expect(
      getOptionalRealtimeItems({
        realtimeItems: undefined,
      }),
    ).toEqual([]);
  });

  test("does not use sample engagement lists when Convex is unavailable", () => {
    expect(
      getOptionalRealtimeItems({
        realtimeItems: undefined,
      }),
    ).toEqual([]);
  });
});
