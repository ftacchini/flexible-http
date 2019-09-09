import { NextFunction, Response} from "express";

export interface HttpResponse {
    writeToHttpResponse(response: Response,  next: NextFunction): Promise<void>;
}