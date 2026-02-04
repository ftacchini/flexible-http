import "reflect-metadata";

// Extension points
export * from "./extension-points";

// Built-ins
export * from "./built-ins";

// Event sources
export * from "./event-sources";

// Helpers
export * from "./helpers";

// Root types and modules
export * from "./http-event-properties";
export * from "./http-event";
export * from "./http-module-builder";
export * from "./http-module";
export * from "./http-source-types";
export * from "./http-body-type";

// Backward compatibility - JsonErrorResponse is now JsonResponse with status code parameter
export { JsonResponse as JsonErrorResponse } from "./built-ins/responses/json-response";
