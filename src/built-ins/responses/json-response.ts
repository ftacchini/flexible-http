import { HttpResponse } from "./http-response";
import { NextFunction, Response} from "express";

export class JsonResponse implements HttpResponse {

    constructor(private data: any, private statusCode: number = 200) {
    }

    public async writeToHttpResponse(response: Response,  next: NextFunction): Promise<void> {
        response.status(this.statusCode).json(this.data);
        next();
    }
}