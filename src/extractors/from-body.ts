import { FlexibleResponse } from "flexible-core";
import { HttpEvent } from "../http-event";
import { TypesHelper } from "../helpers/types-helper";
import { injectable, inject } from "inversify";
import { HttpBodyType } from "./http-body-type";
import { Options, OptionsJson, OptionsUrlencoded, OptionsText } from "body-parser";
import * as BodyParser from "body-parser";
import { HttpExtractor } from "./http-extractor";
import { HTTP_SOURCE_TYPES } from "../http-source-types";


type ParserType = "json" | "raw" | "text" | "urlencoded";

@injectable()
export class FromBody extends HttpExtractor {

    public bodyOptions?: Options | OptionsJson | OptionsUrlencoded | OptionsText;
    public bodyType: HttpBodyType;
    public allBody: boolean;
    
    private static parsersMap = new Map<HttpBodyType, ParserType>(
        [[HttpBodyType.Json, "json"],
         [HttpBodyType.Raw, "raw"],
         [HttpBodyType.Text, "text"],
         [HttpBodyType.Urlencoded, "urlencoded"]])

    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER) typesHelper: TypesHelper) {
        super(typesHelper)
    }

    public async extractValueFromHttpEvent(
        event: HttpEvent, 
        response: FlexibleResponse, 
        filterBinnacle: {
            [key: string]: string;
        }): Promise<any> {

        this.bodyType || (this.bodyType = HttpBodyType.Json);

        var parsers: ParserType[] = (this.bodyType == HttpBodyType.Any) ? 
            Array.from(FromBody.parsersMap.values()) : 
            [FromBody.parsersMap.get(this.bodyType)];
        
        var possibleValues = await Promise.all(parsers.map(parserName => {
            var parser: any = BodyParser[parserName];
            return this.parseBody(parser, event);
        }));        

        return possibleValues.find(value => value);
    }
    
    private parseBody(parser: any, event: HttpEvent): Promise<any> {
        return new Promise((resolve, reject) => {
            parser(this.bodyOptions)(event.data, {}, (error: any) => {
                if(error){
                    resolve(undefined);
                }
                else {
                    resolve(event.data.request.body && (this.allBody ? event.data.request.body : this.name && event.data.request.body[this.name]));
                }
            });
        });
    }
}