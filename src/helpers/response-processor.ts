import { FlexibleResponse } from "flexible-core";
import * as express from "express";
import { injectable } from "inversify";


@injectable()
export class ResponseProcessor {

    public writeToResponse(flexibleResponse: FlexibleResponse[], expressResponse: express.Response, next: express.NextFunction) {
               
        var lastError = this.findResponseInStack(flexibleResponse.map(r => r.errorStack));

        if(lastError) {
            next(lastError);
        }
        else {
            var lastResponse = this.findResponseInStack(flexibleResponse.map(r => r.responseStack));

            if(lastResponse.writeToHttpResponse) {
                lastResponse.writeToHttpResponse(expressResponse, next);
            }
            else {
                expressResponse.json(lastResponse);
                next();
            }
        }
    }

    private findResponseInStack(flexibleResponse: any[][]) {
        var error = flexibleResponse.find(response => {
            return !!(response && response.length)
        });

        return error && error[error.length - 1];
    }
}