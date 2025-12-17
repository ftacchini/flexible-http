import { HttpMethod } from "./http-method";
import { HTTP_SOURCE_TYPES } from "../../http-source-types";
import { RouteProcessor } from "../../helpers/route-processor";
import { inject, injectable } from "tsyringe";

/**
 * HTTP GET filter that matches HTTP GET requests to a specified route path.
 *
 * This filter extends HttpMethod and is used to route GET requests in the flexible-http framework.
 * It can be used standalone or chained with other filters to create nested route structures.
 *
 * @example
 * ```typescript
 * // Simple GET route
 * framework.addPipelineDefinition({
 *   filterStack: [{
 *     type: HttpGet,
 *     configuration: { path: '/users' }
 *   }],
 *   middlewareStack: [...]
 * });
 *
 * // Nested GET route
 * framework.addPipelineDefinition({
 *   filterStack: [
 *     { type: HttpMethod, configuration: { path: '/api' } },
 *     { type: HttpGet, configuration: { path: '/users/:id' } }
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
export class HttpGet extends HttpMethod {

    /**
     * Creates a new HttpGet filter instance.
     *
     * @param routeProcessor - The route processor for parsing and matching URL paths
     */
    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) protected routeProcessor: RouteProcessor) {
        super(routeProcessor);
        this.method = "get";
    }

}