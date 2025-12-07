import { HttpExtractor } from "./http-extractor";
import { TypesHelper } from "../helpers/types-helper";
import { HttpEvent } from "../http-event";
import { FlexibleResponse } from "flexible-core";
import { RouteProcessor } from "../helpers/route-processor";
export declare class FromPath extends HttpExtractor {
    private routeProcessor;
    allPath: boolean;
    constructor(typesHelper: TypesHelper, routeProcessor: RouteProcessor);
    extractValueFromHttpEvent(event: HttpEvent, response: FlexibleResponse, filterBinnacle: {
        [key: string]: string;
    }): Promise<any>;
    private isKey;
}
