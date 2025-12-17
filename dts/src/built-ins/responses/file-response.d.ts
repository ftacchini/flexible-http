import { HttpResponse } from "./http-response";
import { NextFunction, Response } from "express";
export declare class HttpFileResponse implements HttpResponse {
    private filePath;
    private options?;
    constructor(filePath: string, options?: any);
    writeToHttpResponse(response: Response, next: NextFunction): Promise<void>;
}
