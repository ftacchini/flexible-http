import { HttpMethod } from "./http-method";
import { HTTP_SOURCE_TYPES } from "../http-source-types";
import { inject } from "inversify";
import { RouteProcessor } from "../helpers/route-processor";

export class HttpPost extends HttpMethod {
    
    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) protected routeProcessor: RouteProcessor) {
        super(routeProcessor);
        this.method = "post";
    }

}