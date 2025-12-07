import { HttpResponse } from "./http-response";
import { NextFunction, Response } from "express";
export declare class ToLocalsResponse implements HttpResponse {
    private data;
    constructor(data: any);
    writeToHttpResponse(response: Response, next: NextFunction): Promise<void>;
}
