import { NextFunction, Response } from 'express';
import { HttpResponse } from './http-response';
export declare class StreamResponse implements HttpResponse {
    private stream;
    private options?;
    constructor(stream: NodeJS.WritableStream, options?: {
        end: boolean;
    });
    writeToHttpResponse(response: Response, next: NextFunction): Promise<void>;
}
