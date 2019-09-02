import { HttpMethod } from "./http-method";
import { RouteProcessor } from "../helpers/route-processor";
import { HTTP_SOURCE_TYPES } from "../http-source-types";
import { inject } from "inversify";

export class HttpGet extends HttpMethod {
    
    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) protected routeProcessor: RouteProcessor) {
        super(routeProcessor);
        this.method = "delete";
    }

}