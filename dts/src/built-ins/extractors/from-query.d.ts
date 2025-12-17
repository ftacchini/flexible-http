import { HttpExtractor } from "../../extension-points/extractors/http-extractor";
import { TypesHelper } from "../../helpers/types-helper";
import { HttpEvent } from "../../http-event";
import { FlexibleResponse } from "flexible-core";
export declare class FromQuery extends HttpExtractor {
    allQuery: boolean;
    constructor(typesHelper: TypesHelper);
    extractValueFromHttpEvent(event: HttpEvent, response: FlexibleResponse, filterBinnacle: {
        [key: string]: string;
    }, contextBinnacle: {
        [key: string]: any;
    }): Promise<any>;
}
