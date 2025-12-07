import { FlexibleFilter, RouteData } from "flexible-core";
import { HttpEventProperties } from "../http-event-properties";
import { HttpEvent } from "../http-event";
import { RouteProcessor } from "../helpers/route-processor";
export declare class HttpMethod implements FlexibleFilter {
    protected routeProcessor: RouteProcessor;
    constructor(routeProcessor: RouteProcessor);
    isLastFilter: boolean;
    contextName: string;
    method: string;
    private _path;
    set path(value: string);
    get path(): string;
    private _pathTokens;
    private get pathTokens();
    get staticRouting(): Partial<RouteData<HttpEventProperties>>;
    filterEvent(event: HttpEvent, filterBinnacle: {
        [key: string]: string;
    }): Promise<boolean>;
}
