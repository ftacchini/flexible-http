import { HttpMethod } from "./http-method";
import { HTTP_SOURCE_TYPES } from "../http-source-types";
import { inject } from "inversify";
import * as PathToRegex from "path-to-regexp";

export class HttpGet extends HttpMethod {
    
    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) protected routeProcessor: typeof PathToRegex) {
        super(routeProcessor);
        this.method = "get";
    }

}