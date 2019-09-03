import { HttpMethod } from "./http-method";
import * as PathToRegex from "path-to-regexp";
import { HTTP_SOURCE_TYPES } from "../http-source-types";
import { inject } from "inversify";

export class HttpDelete extends HttpMethod {
    
    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) protected routeProcessor: typeof PathToRegex) {
        super(routeProcessor);
        this.method = "delete";
    }

}