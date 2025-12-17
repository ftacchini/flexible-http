import { HttpResponse } from "./http-response";
import { NextFunction, Response } from "express";
export declare class EjsResponse implements HttpResponse {
    private path;
    private data;
    constructor(path: string, data: any);
    writeToHttpResponse(response: Response, next: NextFunction): Promise<void>;
}
