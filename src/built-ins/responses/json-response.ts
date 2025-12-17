import { HttpResponse } from "./http-response";
import { NextFunction, Response} from "express";

export class JsonResponse implements HttpResponse {

    constructor(private data: any) {
    }

    public async writeToHttpResponse(response: Response,  next: NextFunction): Promise<void> {
        response.json(this.data);
        next();
    }
}