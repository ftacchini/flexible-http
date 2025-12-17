import { HttpResponse } from "./http-response";
import { NextFunction, Response} from "express";


export class HttpFileResponse implements HttpResponse {
    
    constructor(private filePath: string, private options?: any) { }

    public async writeToHttpResponse(response: Response, next: NextFunction): Promise<void> {
        return new Promise((resolve, reject) => {
            response.sendFile(this.filePath, this.options, (err) => {
                if(err) {
                    next(err);
                    reject(err);
                }
                else{
                    next();
                    resolve();
                }
            });
        }) 
    }
}
