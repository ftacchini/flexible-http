import { HttpResponse } from "./http-response";
import * as express from "express";

export class JsonResponse implements HttpResponse {

    constructor(private data: any) {
    }

    public async writeToHttpResponse(response: express.Response,  next: express.NextFunction): Promise<void> {
        response.json(this.data);
        next();
    }
}