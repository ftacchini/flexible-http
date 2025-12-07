import { FlexibleEvent, RouteData } from "flexible-core";
import { HttpEventProperties } from "./http-event-properties";
import { Request, Response } from "express";
export declare class HttpEvent implements FlexibleEvent {
    private request;
    private response;
    static EventType: string;
    readonly routeData: RouteData<HttpEventProperties>;
    readonly requestId?: string;
    readonly sourceIp: string;
    constructor(request: Request, response: Response, requestId?: string);
    get data(): {
        request: Request;
        response: Response;
    };
    get eventType(): string;
}
