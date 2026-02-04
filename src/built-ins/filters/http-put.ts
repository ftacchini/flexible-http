import { HttpMethod } from "./http-method";
import { HTTP_SOURCE_TYPES } from "../../http-source-types";
import { RouteProcessor } from "../../helpers/route-processor";
import { inject, injectable } from "tsyringe";

/**
 * HTTP PUT filter that matches HTTP PUT requests to a specified route path.
 *
 * This filter extends HttpMethod and is used to route PUT requests in the flexible-http framework.
 * PUT requests are typically used for updating or replacing resources on the server.
 *
 * @example
 * ```typescript
 * // Simple PUT route for updating users
 * framework.addPipelineDefinition({
 *   filterStack: [{
 *     type: HttpPut,
 *     configuration: { path: '/users/:id' }
 *   }],
 *   middlewareStack: [...]
 * });
 *
 * // Nested PUT route
 * framework.addPipelineDefinition({
 *   filterStack: [
 *     { type: HttpMethod, configuration: { path: '/api/v1' } },
 *     { type: HttpPut, configuration: { path: '/users/:id' } }
 *   ],
 *   middlewareStack: [...]
 * });
 * ```
 *
 * @see HttpMethod for base filter functionality
 * @see HttpPost for POST request filtering
 * @see HttpPatch for PATCH request filtering
 */
@injectable()
export class HttpPut extends HttpMethod {

    /**
     * Creates a new HttpPut filter instance.
     *
     * @param routeProcessor - The route processor for parsing and matching URL paths
     */
    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) protected routeProcessor: RouteProcessor) {
        super(routeProcessor);
        this.method = "put";
    }

}
