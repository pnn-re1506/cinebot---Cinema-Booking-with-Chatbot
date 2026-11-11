import type { components, operations, paths } from "./schema";

export type Schemas = components["schemas"];
export type ApiPaths = paths;
export type ApiOperations = operations;
export type ErrorCode = Schemas["ErrorCode"];
export type Problem = Schemas["Problem"];
