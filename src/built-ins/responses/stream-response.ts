import { NextFunction, Response, Request } from 'express';
import { HttpResponse } from './http-response';

export class StreamResponse implements HttpResponse {

    constructor(private stream: NodeJS.WritableStream, private options?: { end: boolean }) {}

    public async writeToHttpResponse(response: Response, next: NextFunction): Promise<void> {
        response.pipe(this.stream, this.options);
        this.options && this.options.end && next();
    }
}