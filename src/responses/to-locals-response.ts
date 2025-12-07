import { HttpResponse } from "./http-response";
import { NextFunction, Response} from "express";
import { assign } from "lodash"

export class ToLocalsResponse implements HttpResponse {

    constructor(private data: any) {
    }

    public async writeToHttpResponse(response: Response,  next: NextFunction): Promise<void> {
        if (response.locals) {
            assign(response.locals, this.data);
        } else {
            response.locals = this.data;
        }
        next();
    }
}