import { HttpExtractor } from "./http-extractor";
import { injectable, inject } from "inversify";
import { HTTP_SOURCE_TYPES } from "../http-source-types";
import { TypesHelper } from "../helpers/types-helper";
import { HttpEvent } from "../http-event";
import { FlexibleResponse } from "flexible-core";

@injectable()
export class FromQuery extends HttpExtractor {
    
    public allQuery: boolean;
    
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
            return event.data && 
                event.data.query && 
                this.allQuery ? 
                    event.data.query : 
                    this.name && event.data.query[this.name];
        
    }
}