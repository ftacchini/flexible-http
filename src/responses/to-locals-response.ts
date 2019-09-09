import { HttpResponse } from "./http-response";
import { NextFunction, Response} from "express";
import { assign } from "lodash"

export class ToLocalsResponse implements HttpResponse {

    constructor(private data: any) {
    }

    public async writeToHttpResponse(response: Response,  next: NextFunction): Promise<void> {
        response.locals ? (response.locals = this.data) : assign(response.locals, this.data);
        next();
    }
}