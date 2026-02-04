import { HttpMethod } from "./http-method";
import { HTTP_SOURCE_TYPES } from "../../http-source-types";
import { RouteProcessor } from "../../helpers/route-processor";
import { inject, injectable } from "tsyringe";

/**
 * HTTP OPTIONS filter that matches HTTP OPTIONS requests to a specified route path.
 *
 * This filter extends HttpMethod and is used to route OPTIONS requests in the flexible-http framework.
 * OPTIONS requests are typically used for CORS preflight checks and discovering allowed HTTP methods.
 *
 * @example
 * ```typescript
 * // Simple OPTIONS route for CORS preflight
 * framework.addPipelineDefinition({
 *   filterStack: [{
 *     type: HttpOption,
 *     configuration: { path: '/api/*' }
 *   }],
 *   middlewareStack: [...]
 * });
 *
 * // Nested OPTIONS route
 * framework.addPipelineDefinition({
 *   filterStack: [
 *     { type: HttpMethod, configuration: { path: '/api/v1' } },
 *     { type: HttpOption, configuration: { path: '/*' } }
 *   ],
 *   middlewareStack: [...]
 * });
 * ```
 *
 * @see HttpMethod for base filter functionality
 * @see HttpGet for GET request filtering
 * @see HttpHead for HEAD request filtering
 */
@injectable()
export class HttpOption extends HttpMethod {

    /**
     * Creates a new HttpOption filter instance.
     *
     * @param routeProcessor - The route processor for parsing and matching URL paths
     */
    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) protected routeProcessor: RouteProcessor) {
        super(routeProcessor);
        this.method = "options";
    }

}
