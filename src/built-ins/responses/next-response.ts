import { HttpResponse } from "./http-response";
import { NextFunction, Response} from "express";

export class NextResponse implements HttpResponse {

    constructor(private data: any) {
    }

    public async writeToHttpResponse(response: Response,  next: NextFunction): Promise<void> {
        next();
    }
}