import { HttpMethod } from "./http-method";
import { RouteProcessor } from "../../helpers/route-processor";
export declare class HttpDelete extends HttpMethod {
    protected routeProcessor: RouteProcessor;
    constructor(routeProcessor: RouteProcessor);
}
