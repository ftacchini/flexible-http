import { HttpMethod } from "./http-method";
import { HTTP_SOURCE_TYPES } from "../../http-source-types";
import { RouteProcessor } from "../../helpers/route-processor";
import { inject, injectable } from "tsyringe";

/**
 * HTTP PATCH filter that matches HTTP PATCH requests to a specified route path.
 *
 * This filter extends HttpMethod and is used to route PATCH requests in the flexible-http framework.
 * PATCH requests are typically used for partially updating existing resources on the server.
 *
 * @example
 * ```typescript
 * // Simple PATCH route for updating a user
 * framework.addPipelineDefinition({
 *   filterStack: [{
 *     type: HttpPatch,
 *     configuration: { path: '/users/:id' }
 *   }],
 *   middlewareStack: [...]
 * });
 *
 * // Nested PATCH route
 * framework.addPipelineDefinition({
 *   filterStack: [
 *     { type: HttpMethod, configuration: { path: '/api/v1' } },
 *     { type: HttpPatch, configuration: { path: '/users/:id' } }
 *   ],
 *   middlewareStack: [...]
 * });
 * ```
 *
 * @see HttpMethod for base filter functionality
 * @see HttpPost for POST request filtering
 * @see HttpDelete for DELETE request filtering
 */
@injectable()
export class HttpPatch extends HttpMethod {

    /**
     * Creates a new HttpPatch filter instance.
     *
     * @param routeProcessor - The route processor for parsing and matching URL paths
     */
    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) protected routeProcessor: RouteProcessor) {
        super(routeProcessor);
        this.method = "patch";
    }

}