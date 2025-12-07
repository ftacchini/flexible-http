import { FlexibleResponse } from "flexible-core";
import { HttpEvent } from "../http-event";
import { HttpExtractor } from "./http-extractor";
import { TypesHelper } from "../helpers/types-helper";
export declare class FromHeaders extends HttpExtractor {
    allHeaders: boolean;
    constructor(typesHelper: TypesHelper);
    extractValueFromHttpEvent(event: HttpEvent, response: FlexibleResponse, filterBinnacle: {
        [key: string]: string;
    }): Promise<any>;
}
