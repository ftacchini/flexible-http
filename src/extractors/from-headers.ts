import { FlexibleResponse } from "flexible-core";
import { HttpEvent } from "../http-event";
import { HttpExtractor } from "./http-extractor";
import { HTTP_SOURCE_TYPES } from "../http-source-types";
import { TypesHelper } from "../helpers/types-helper";
import { inject, injectable } from "inversify";

@injectable()
export class FromHeaders extends HttpExtractor {

    public allHeaders: boolean;

    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER) typesHelper: TypesHelper) {
        super(typesHelper)
    }
    
    public async extractValueFromHttpEvent(
        event: HttpEvent, 
        response: FlexibleResponse, 
        filterBinnacle: {
            [key: string]: string;
        }): Promise<any> {
        return event.data.request && 
            event.data.request.headers && 
            this.allHeaders ? 
                event.data.request.header : 
                this.name && event.data.request.headers[this.name];
    }
    
}