import { FlexibleResponse } from "flexible-core";
import { injectable } from "inversify";
import { AcceptedResponse } from "../responses/accepted-response";
import { NextFunction, Response} from "express";


@injectable()
export class ResponseProcessor {

    public async writeToResponse(
        flexibleResponse: FlexibleResponse[],
        expressResponse: Response, 
        next: NextFunction) {
        
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

        var response = new AcceptedResponse(lastResponse);
        await response.writeToHttpResponse(expressResponse, next);
    }

    private findResponseInStack(flexibleResponse: any[][]) {
        var res = flexibleResponse.find(response => {
            return !!(response && response.length)
        });

        return res && res[res.length - 1];
    }
}