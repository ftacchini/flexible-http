import * as express from "express";

export interface HttpResponse {
    writeToHttpResponse(response: express.Response,  next: express.NextFunction): Promise<void>;
}