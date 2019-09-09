import { HttpExtractor } from "./http-extractor";
import { inject } from "inversify";
import { HTTP_SOURCE_TYPES } from "../http-source-types";
import { TypesHelper } from "../helpers";
import { HttpEvent } from "../http-event";
import { FlexibleResponse } from "flexible-core";

export class FromLocals extends HttpExtractor {

    public allLocals: boolean;
    
    constructor(
        @inject(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER) typesHelper: TypesHelper) {
        super(typesHelper)
    }

    public async extractValueFromHttpEvent(
        event: HttpEvent, 
        response: FlexibleResponse, 
        filterBinnacle: {
            [key: string]: string;
        }): Promise<any> {
            return event.data.response && 
                event.data.response.locals && 
                this.allLocals ? 
                    event.data.response.locals : 
                    this.name && event.data.response.locals[this.name];
        
    }
}