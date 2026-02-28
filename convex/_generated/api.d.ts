/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiExplanation from "../aiExplanation.js";
import type * as apiKeys from "../apiKeys.js";
import type * as architecture from "../architecture.js";
import type * as architectures from "../architectures.js";
import type * as awsDeployment from "../awsDeployment.js";
import type * as riskEngine from "../riskEngine.js";
import type * as settings from "../settings.js";
import type * as setup from "../setup.js";
import type * as simulations from "../simulations.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiExplanation: typeof aiExplanation;
  apiKeys: typeof apiKeys;
  architecture: typeof architecture;
  architectures: typeof architectures;
  awsDeployment: typeof awsDeployment;
  riskEngine: typeof riskEngine;
  settings: typeof settings;
  setup: typeof setup;
  simulations: typeof simulations;
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
