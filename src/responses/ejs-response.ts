import { HttpResponse } from "./http-response";
import { NextFunction, Response} from "express";

export class EjsResponse implements HttpResponse {

    constructor(private path: string, private data: any) {}

    public async writeToHttpResponse(response: Response,  next: NextFunction): Promise<void> {
        response.render(this.path, this.data);
        next();
    }
}