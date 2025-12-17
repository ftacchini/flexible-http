import { HttpMethod } from "./http-method";
import { HTTP_SOURCE_TYPES } from "../../http-source-types";
import { RouteProcessor } from "../../helpers/route-processor";
import { inject, injectable } from "tsyringe";

/**
 * HTTP HEAD filter that matches HTTP HEAD requests to a specified route path.
 *
 * This filter extends HttpMethod and is used to route HEAD requests in the flexible-http framework.
 * HEAD requests are identical to GET requests except that the server must not return a message body.
 * They are typically used to retrieve metadata about a resource without transferring the resource itself.
 *
 * @example
 * ```typescript
 * // Simple HEAD route for checking if a resource exists
 * framework.addPipelineDefinition({
 *   filterStack: [{
 *     type: HttpHead,
 *     configuration: { path: '/users/:id' }
 *   }],
 *   middlewareStack: [...]
 * });
 *
 * // Nested HEAD route
 * framework.addPipelineDefinition({
 *   filterStack: [
 *     { type: HttpMethod, configuration: { path: '/api' } },
 *     { type: HttpHead, configuration: { path: '/health' } }
 *   ],
 *   middlewareStack: [...]
 * });
 * ```
 *
 * @see HttpMethod for base filter functionality
 * @see HttpGet for GET request filtering
 */
@injectable()
export class HttpHead extends HttpMethod {

    /**
     * Creates a new HttpHead filter instance.
     *
     * @param routeProcessor - The route processor for parsing and matching URL paths
     */
    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) protected routeProcessor: RouteProcessor) {
        super(routeProcessor);
        this.method = "head";
    }

}