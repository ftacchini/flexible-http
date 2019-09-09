import { FlexibleExtractor, RouteData, FlexibleResponse } from "flexible-core";
import { HttpEventProperties } from "../http-event-properties";
import { HttpEvent } from "../http-event";

export class ExpressRequest implements FlexibleExtractor {

    public get staticRouting(): Partial<RouteData<HttpEventProperties>> {
        return {
            eventType: HttpEvent.EventType
        };
    };
    
    public async extractValue(event: HttpEvent, response: FlexibleResponse, filterBinnacle: {
        [key: string]: string;
    }): Promise<any> {
        return event.data.request;
    }
    
}