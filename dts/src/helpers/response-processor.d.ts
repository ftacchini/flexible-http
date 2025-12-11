import { FlexibleResponse, FlexibleLogger } from "flexible-core";
import { NextFunction, Response } from "express";
export declare class ResponseProcessor {
    private logger;
    constructor(logger: FlexibleLogger);
    writeToResponse(flexibleResponse: FlexibleResponse[], expressResponse: Response, next: NextFunction): Promise<void>;
    private findErrorInStack;
    private findResponseInStack;
}
