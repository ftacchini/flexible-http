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
    readonly cancellationToken?: AbortSignal;
    constructor(request: Request, response: Response, requestId?: string, cancellationToken?: AbortSignal);
    get data(): {
        request: Request;
        response: Response;
    };
    get eventType(): string;
}
