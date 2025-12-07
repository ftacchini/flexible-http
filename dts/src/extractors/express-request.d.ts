import { FlexibleExtractor, RouteData, FlexibleResponse } from "flexible-core";
import { HttpEventProperties } from "../http-event-properties";
import { HttpEvent } from "../http-event";
export declare class ExpressRequest implements FlexibleExtractor {
    get staticRouting(): Partial<RouteData<HttpEventProperties>>;
    extractValue(event: HttpEvent, response: FlexibleResponse, filterBinnacle: {
        [key: string]: string;
    }): Promise<any>;
}
