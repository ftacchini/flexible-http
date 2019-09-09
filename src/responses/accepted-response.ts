import { HttpResponse } from "./http-response";
import { NextFunction, Response} from "express";


export class AcceptedResponse implements HttpResponse {

    constructor(private value: any) {}

    public async writeToHttpResponse(response: Response,  next: NextFunction): Promise<void> {
        if(this.value !== undefined) {
            response.format({
                'application/json': () => {
                    response.json(this.value);
                },
                'default': () => {
                    response.send(this.value);
                }
            });
        }

        next();

    }

}