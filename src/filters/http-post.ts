import { HttpMethod } from "./http-method";
import { HTTP_SOURCE_TYPES } from "../http-source-types";
import { RouteProcessor } from "../helpers/route-processor";
import { inject } from "inversify";

/**
 * HTTP POST filter that matches HTTP POST requests to a specified route path.
 *
 * This filter extends HttpMethod and is used to route POST requests in the flexible-http framework.
 * POST requests are typically used for creating resources or submitting data to the server.
 *
 * @example
 * ```typescript
 * // Simple POST route for creating users
 * framework.addPipelineDefinition({
 *   filterStack: [{
 *     type: HttpPost,
 *     configuration: { path: '/users' }
 *   }],
 *   middlewareStack: [...]
 * });
 *
 * // Nested POST route
 * framework.addPipelineDefinition({
 *   filterStack: [
 *     { type: HttpMethod, configuration: { path: '/api/v1' } },
 *     { type: HttpPost, configuration: { path: '/users' } }
 *   ],
 *   middlewareStack: [...]
 * });
 * ```
 *
 * @see HttpMethod for base filter functionality
 * @see HttpGet for GET request filtering
 * @see HttpPatch for PATCH request filtering
 */
export class HttpPost extends HttpMethod {

    /**
     * Creates a new HttpPost filter instance.
     *
     * @param routeProcessor - The route processor for parsing and matching URL paths
     */
    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) protected routeProcessor: RouteProcessor) {
        super(routeProcessor);
        this.method = "post";
    }

}