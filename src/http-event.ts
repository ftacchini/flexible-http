import { FlexibleEvent, RouteData } from "flexible-core";
import { HttpEventProperties } from "./http-event-properties";
import { Request, Response} from "express";

export class HttpEvent implements FlexibleEvent{
    
    public static EventType = "HttpEvent"
    public readonly routeData: RouteData<HttpEventProperties>;

    constructor(
        private request: Request, 
        private response: Response) {
        
        this.routeData = {
            method: request.method.toLowerCase(),
            routeParts: request.path.split("/").filter(p => p),
            route: request.url,
            protocol: request.protocol,
            httpVersion: request.httpVersion,
            eventType: HttpEvent.EventType
        }
    }

    public get data(): { request: Request, response: Response} {
        return { request: this.request, response: this.response };
    }


    public get eventType(): string {
        return HttpEvent.EventType;
    };
}