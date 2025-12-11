import { FlexibleResponse, FlexibleLogger, FLEXIBLE_APP_TYPES } from "flexible-core";
import { inject, injectable } from "tsyringe";
import { AcceptedResponse } from "../responses/accepted-response";
import { NextFunction, Response} from "express";


@injectable()
export class ResponseProcessor {

    constructor(
        @inject(FLEXIBLE_APP_TYPES.LOGGER) private logger: FlexibleLogger
    ) {}

    public async writeToResponse(
        flexibleResponse: FlexibleResponse[],
        expressResponse: Response,
        next: NextFunction) {

        this.logger.debug("writeToResponse START");

        if(!flexibleResponse) {
            this.logger.debug("No flexibleResponse, calling next()");
            next();
            return;
        }

        this.logger.debug("Checking for errors in stack");
        this.logger.debug("Error stacks", { errorStacks: flexibleResponse.map(r => r.errorStack) });
        var errorResult = this.findErrorInStack(flexibleResponse.map(r => r.errorStack));

        // Check if an error was found
        if(errorResult.found) {
            this.logger.debug("Found error", {
                error: errorResult.error,
                errorType: typeof errorResult.error,
                errorKeys: Object.keys(errorResult.error || {})
            });
            // Convert null/undefined errors to proper Error objects for Express
            const errorToPass = (errorResult.error === null || errorResult.error === undefined)
                ? new Error("Null or undefined error thrown")
                : errorResult.error;
            next(errorToPass);
            return;
        }

        this.logger.debug("Finding last response in stack");
        var lastResponse = this.findResponseInStack(flexibleResponse.map(r => r.responseStack));

        if(lastResponse && lastResponse.writeToHttpResponse) {
            this.logger.debug("Response has writeToHttpResponse, calling it");
            lastResponse.writeToHttpResponse(expressResponse, next);
            this.logger.debug("writeToHttpResponse completed");
            return
        }

        this.logger.debug("Creating AcceptedResponse");
        var response = new AcceptedResponse(lastResponse);
        this.logger.debug("Writing AcceptedResponse to HTTP");
        await response.writeToHttpResponse(expressResponse, next);
        this.logger.debug("writeToResponse END");
    }

    private findErrorInStack(flexibleResponse: any[][]): { found: boolean; error: any } {
        // Find the first non-empty error stack
        // Note: We check for Array.isArray and length > 0 to handle null/undefined errors
        var res = flexibleResponse.find(response => {
            return Array.isArray(response) && response.length > 0;
        });

        // Return an object indicating whether an error was found and what it was
        // This allows us to distinguish between "no error" and "error is undefined"
        if (res) {
            return { found: true, error: res[res.length - 1] };
        }
        return { found: false, error: undefined };
    }

    private findResponseInStack(flexibleResponse: any[][]): any {
        // Find the first non-empty response stack
        var res = flexibleResponse.find(response => {
            return Array.isArray(response) && response.length > 0;
        });

        // Return the last response in the stack
        return res ? res[res.length - 1] : undefined;
    }
}