import { FlexibleResponse } from "flexible-core";
import * as express from "express";
import { injectable } from "inversify";


@injectable()
export class ResponseProcessor {

    public writeToResponse(flexibleResponse: FlexibleResponse[], expressResponse: express.Response, next: express.NextFunction) {
        
        if(!flexibleResponse) {
            next();
            return;
        }

        var lastError = this.findResponseInStack(flexibleResponse.map(r => r.errorStack));

        if(lastError) {
            next(lastError);
            return;
        }

        var lastResponse = this.findResponseInStack(flexibleResponse.map(r => r.responseStack));

        if(lastResponse && lastResponse.writeToHttpResponse) {
            lastResponse.writeToHttpResponse(expressResponse, next);
            return
        }

        expressResponse.json(lastResponse);
        next();
    }

    private findResponseInStack(flexibleResponse: any[][]) {
        var res = flexibleResponse.find(response => {
            return !!(response && response.length)
        });

        return res && res[res.length - 1];
    }
}