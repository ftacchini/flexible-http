import { HttpExtractor } from "./http-extractor";
import { HTTP_SOURCE_TYPES } from "../http-source-types";
import { inject, injectable } from "inversify";
import { TypesHelper } from "../helpers/types-helper";
import { HttpEvent } from "../http-event";
import { FlexibleResponse } from "flexible-core";
import * as PathToRegex from "path-to-regexp";
import { isNullOrUndefined } from "util";

@injectable()
export class FromPath extends HttpExtractor{

    public allPath: boolean;
    
    constructor(
        @inject(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER) typesHelper: TypesHelper,
        @inject(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) routeProcessor: typeof PathToRegex) {
        super(typesHelper)
    }

    public async extractValueFromHttpEvent(
        event: HttpEvent, 
        response: FlexibleResponse, 
        filterBinnacle: {
            [key: string]: string;
        }): Promise<any> {

            let keys: PathToRegex.Key[] = [];
            const regex = PathToRegex(filterBinnacle.path, keys);

            let resultingKeys = regex.exec(event.data.request.path);
            
            if(isNullOrUndefined(resultingKeys)) {
                return resultingKeys;
            }
            
            if(this.allPath) {
                let pathObject: { [index:string]: string } = {};
                
                keys.forEach((key, index) => {
                    this.isKey(key) && (pathObject[key.name] = resultingKeys[index])
                });

                return pathObject;
            }
            else if (this.name){
                let key = keys.find(key => this.isKey(key) && key.name == this.name);
                return key && resultingKeys[keys.indexOf(key)]; 
            }

            return null;
    }

    private isKey(key: string | PathToRegex.Key): key is PathToRegex.Key {
        return (key as PathToRegex.Key).name !== undefined;
    }
}