import { HttpMethod } from "./http-method";
import { HTTP_SOURCE_TYPES } from "../../http-source-types";
import { RouteProcessor } from "../../helpers/route-processor";
import { inject, injectable } from "tsyringe";

/**
 * HTTP DELETE filter that matches HTTP DELETE requests to a specified route path.
 *
 * This filter extends HttpMethod and is used to route DELETE requests in the flexible-http framework.
 * DELETE requests are typically used for removing resources from the server.
 *
 * @example
 * ```typescript
 * // Simple DELETE route for removing a user
 * framework.addPipelineDefinition({
 *   filterStack: [{
 *     type: HttpDelete,
 *     configuration: { path: '/users/:id' }
 *   }],
 *   middlewareStack: [...]
 * });
 *
 * // Nested DELETE route
 * framework.addPipelineDefinition({
 *   filterStack: [
 *     { type: HttpMethod, configuration: { path: '/api' } },
 *     { type: HttpDelete, configuration: { path: '/users/:id' } }
 *   ],
 *   middlewareStack: [...]
 * });
 * ```
 *
 * @see HttpMethod for base filter functionality
 * @see HttpGet for GET request filtering
 * @see HttpPost for POST request filtering
 */
@injectable()
export class HttpDelete extends HttpMethod {

    /**
     * Creates a new HttpDelete filter instance.
     *
     * @param routeProcessor - The route processor for parsing and matching URL paths
     */
    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) protected routeProcessor: RouteProcessor) {
        super(routeProcessor);
        this.method = "delete";
    }

}