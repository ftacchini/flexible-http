import { FlexibleExtractor, RouteData, FlexibleResponse } from "flexible-core";
import { HttpEvent } from "../http-event";
import { HttpEventProperties } from "../http-event-properties";
import { TypesHelper } from "../helpers/types-helper";
import { injectable } from "inversify";
import { HttpBodyType } from "./http-body-type";
import { Options, OptionsJson, OptionsUrlencoded, OptionsText } from "body-parser";
import * as BodyParser from "body-parser";


type ParserType = "json" | "raw" | "text" | "urlencoded";

@injectable()
export class FromBody implements FlexibleExtractor {

    public bodyOptions?: Options | OptionsJson | OptionsUrlencoded | OptionsText;
    public bodyType: HttpBodyType;
    public contextName?: string;
    public contextType?: any;
    
    private _name: string;
    public set name(value: string) {
        this._name = value;
    } 
    public get name(): string {
        return this._name || this.contextName;
    }
    
    private _type: any;
    public set type(value: any) {
        this._type = value;
    } 
    public get type(): any {
        return this._type || this.contextType;
    }

    private static parsersMap = new Map<HttpBodyType, ParserType>(
        [[HttpBodyType.Json, "json"],
         [HttpBodyType.Raw, "raw"],
         [HttpBodyType.Text, "text"],
         [HttpBodyType.Urlencoded, "urlencoded"]])

    constructor(private typesHelper: TypesHelper) {
    }

    public get staticRouting(): Partial<RouteData<HttpEventProperties>> {
        return {
            eventType: HttpEvent.EventType
        };
    };

    public async extractValue(event: HttpEvent, response: FlexibleResponse): Promise<any> {

        this.bodyType || (this.bodyType = HttpBodyType.Json);

        var parsers: ParserType[] = (this.bodyType == HttpBodyType.Any) ? 
            Array.from(FromBody.parsersMap.values()) : 
            [FromBody.parsersMap.get(this.bodyType)];
        
        var possibleValues = await Promise.all(parsers.map(parserName => {
            var parser: any = BodyParser[parserName];
            return this.parseBody(parser, event);
        }));        

        return this.typesHelper.castToType(possibleValues.find(value => value), this.type);
    }
    
    private parseBody(parser: any, event: HttpEvent): Promise<any> {
        return new Promise((resolve, reject) => {
            parser(this.bodyOptions)(event.data, {}, (error: any) => {
                if(error){
                    resolve();
                }
                else {
                    resolve(event.data.body && (this.name ? event.data.body[this.name] : event.data.body));
                }
            });
        });
    }
}