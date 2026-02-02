import { HttpResponse } from "./http-response";
import { NextFunction, Response } from "express";
export declare class JsonErrorResponse implements HttpResponse {
    private statusCode;
    private message?;
    constructor(statusCode: number, message?: string);
    writeToHttpResponse(response: Response, next: NextFunction): Promise<void>;
    private getDefaultMessage;
}
