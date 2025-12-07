import { FlexibleResponse } from "flexible-core";
import { HttpEvent } from "../http-event";
import { TypesHelper } from "../helpers/types-helper";
import { HttpBodyType } from "./http-body-type";
import { Options, OptionsJson, OptionsUrlencoded, OptionsText } from "body-parser";
import { HttpExtractor } from "./http-extractor";
export declare class FromBody extends HttpExtractor {
    bodyOptions?: Options | OptionsJson | OptionsUrlencoded | OptionsText;
    bodyType: HttpBodyType;
    allBody: boolean;
    private static parsersMap;
    constructor(typesHelper: TypesHelper);
    extractValueFromHttpEvent(event: HttpEvent, response: FlexibleResponse, filterBinnacle: {
        [key: string]: string;
    }): Promise<any>;
    private parseBody;
}
