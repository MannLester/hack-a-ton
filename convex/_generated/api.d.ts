/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as authIssuer from "../authIssuer.js";
import type * as files from "../files.js";
import type * as hackathons from "../hackathons.js";
import type * as leaderboards from "../leaderboards.js";
import type * as organizers from "../organizers.js";
import type * as portfolio from "../portfolio.js";
import type * as results from "../results.js";
import type * as seed from "../seed.js";
import type * as staff from "../staff.js";
import type * as teams from "../teams.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  authIssuer: typeof authIssuer;
  files: typeof files;
  hackathons: typeof hackathons;
  leaderboards: typeof leaderboards;
  organizers: typeof organizers;
  portfolio: typeof portfolio;
  results: typeof results;
  seed: typeof seed;
  staff: typeof staff;
  teams: typeof teams;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
