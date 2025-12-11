import { FlexibleFilter, RouteData } from "flexible-core";
import { HttpEventProperties } from "../http-event-properties";
import { HttpEvent } from "../http-event";
import { injectable, inject } from "tsyringe";
import { HTTP_SOURCE_TYPES } from "../http-source-types";
import { Key } from "path-to-regexp";
import { flatten } from "lodash";
import { RouteProcessor } from "../helpers/route-processor";

/**
 * Base HTTP method filter that provides route matching functionality for HTTP requests.
 *
 * This class implements the FlexibleFilter interface and serves as the foundation for all
 * HTTP method-specific filters (GET, POST, DELETE, PATCH, HEAD). It handles path matching,
 * route composition, and static routing information.
 *
 * The filter supports:
 * - Static path segments (e.g., '/users')
 * - Dynamic path parameters (e.g., '/users/:id')
 * - Nested route composition through filter chaining
 * - Regular expression-based path matching
 *
 * @example
 * ```typescript
 * // Used as a base for method-specific filters
 * class HttpGet extends HttpMethod {
 *   constructor(routeProcessor: RouteProcessor) {
 *     super(routeProcessor);
 *     this.method = "get";
 *   }
 * }
 *
 * // Can also be used directly for method-agnostic routing
 * framework.addPipelineDefinition({
 *   filterStack: [
 *     { type: HttpMethod, configuration: { path: '/api' } },
 *     { type: HttpGet, configuration: { path: '/users' } }
 *   ],
 *   middlewareStack: [...]
 * });
 * ```
 *
 * @see HttpGet for GET request filtering
 * @see HttpPost for POST request filtering
 * @see HttpDelete for DELETE request filtering
 * @see HttpPatch for PATCH request filtering
 * @see HttpHead for HEAD request filtering
 */
@injectable()
export class HttpMethod implements FlexibleFilter {

    /**
     * Creates a new HttpMethod filter instance.
     *
     * @param routeProcessor - The route processor for parsing and matching URL paths
     */
    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) protected routeProcessor: RouteProcessor) {
    }

    /**
     * Indicates whether this is the last filter in the filter stack.
     * Used to determine if the path should match exactly (end=true) or allow continuation.
     */
    public isLastFilter: boolean;

    /**
     * The context name for this filter, used as a fallback path if no explicit path is set.
     */
    public contextName: string;

    /**
     * The HTTP method this filter matches (e.g., "get", "post", "delete", "patch", "head").
     */
    public method: string;

    private _path: string;

    /**
     * Sets the route path for this filter.
     *
     * @param value - The path pattern (e.g., '/users', '/users/:id')
     */
    public set path(value: string) {
        this._path = value;
    }

    /**
     * Gets the route path for this filter.
     * If no explicit path is set, returns a path based on the contextName.
     *
     * @returns The route path pattern
     */
    public get path() {
        return this._path ? this._path : ("/" + this.contextName)
    }

    private _pathTokens: any[];

    /**
     * Gets the parsed path tokens from the route processor.
     * Tokens are cached after first parse for performance.
     *
     * @returns Array of path tokens (strings and parameter objects)
     */
    private get pathTokens(): any[] {
        if(!this._pathTokens) {
            this._pathTokens = this.routeProcessor.parse(this.path);
        }

        return this._pathTokens;
    }

    /**
     * Gets static routing information for this filter.
     * This is used by the framework for route optimization and static analysis.
     *
     * @returns Partial route data containing event type, method, and static route parts
     */
    public get staticRouting(): Partial<RouteData<HttpEventProperties>> {
        return {
            eventType: HttpEvent.EventType,
            method: this.method,
            routeParts: flatten(this.pathTokens
                .filter((token: any) => typeof token === 'string')
                .map((token: string) => token.split("/")))
                .filter((p: string) => p) // Remove empty strings
        };
    };

    /**
     * Filters an HTTP event based on the configured path pattern.
     *
     * This method is called by the framework to determine if this filter matches
     * the incoming HTTP request. It supports:
     * - Path composition through the filterBinnacle
     * - Dynamic path parameters
     * - Partial matching for non-terminal filters
     * - Exact matching for terminal filters
     *
     * @param event - The HTTP event to filter
     * @param filterBinnacle - Shared state object for composing paths across multiple filters
     * @returns Promise resolving to true if the event matches, false otherwise
     *
     * @example
     * ```typescript
     * // For a filter stack: [HttpMethod('/api'), HttpGet('/users')]
     * // The filterBinnacle accumulates: { path: '/api/users' }
     * // And matches against the request path
     * ```
     */
    public async filterEvent(
        event: HttpEvent,
        filterBinnacle: {
            [key: string]: string;
        }): Promise<boolean> {

            filterBinnacle.path ? (filterBinnacle.path += this.path) : (filterBinnacle.path = this.path);

            const regex = this.routeProcessor.pathToRegexp(filterBinnacle.path, null, {
                start: !this.isLastFilter,
                end: this.isLastFilter
            });

            return regex.test(event.data.request.path);
    }
}