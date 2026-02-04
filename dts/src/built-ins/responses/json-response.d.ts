import { HttpResponse } from "./http-response";
import { NextFunction, Response } from "express";
export declare class JsonResponse implements HttpResponse {
    private data;
    private statusCode;
    constructor(data: any, statusCode?: number);
    writeToHttpResponse(response: Response, next: NextFunction): Promise<void>;
}
