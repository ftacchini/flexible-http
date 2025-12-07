import { FlexibleResponse } from "flexible-core";
import { NextFunction, Response } from "express";
export declare class ResponseProcessor {
    writeToResponse(flexibleResponse: FlexibleResponse[], expressResponse: Response, next: NextFunction): Promise<void>;
    private findResponseInStack;
}
