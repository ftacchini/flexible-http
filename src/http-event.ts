import { FlexibleEvent, RouteData } from "flexible-core";
import { HttpEventProperties } from "./http-event-properties";
import * as express from "express";

export class HttpEvent implements FlexibleEvent{
    
    public static EventType = "HttpEvent"
    public readonly routeData: RouteData<HttpEventProperties>;

    constructor(private request: express.Request) {
        this.routeData = {
            method: request.method,
            routeParts: request.url.split("/"),
            route: request.url,
            protocol: request.protocol,
            httpVersion: request.httpVersion,
            eventType: HttpEvent.EventType
        }
    }

    public get data(): express.Request {
        return this.request;
    }


    public get eventType(): string {
        return HttpEvent.EventType;
    };
}