import { HttpResponse } from "./http-response";
import { NextFunction, Response } from "express";
export declare class AcceptedResponse implements HttpResponse {
    private value;
    constructor(value: any);
    writeToHttpResponse(response: Response, next: NextFunction): Promise<void>;
}
