import { FlexibleExtractor, RouteData, FlexibleResponse } from "flexible-core";
import { HttpEventProperties } from "../http-event-properties";
import { HttpEvent } from "../http-event";
import { TypesHelper } from "../helpers/types-helper";
import { inject, injectable } from "inversify";
import { HTTP_SOURCE_TYPES } from "../http-source-types";

@injectable()
export abstract class HttpExtractor implements FlexibleExtractor {

    public contextName?: string;
    private _name: string;
    public set name(value: string) {
        this._name = value;
    } 
    public get name(): string {
        return this._name || this.contextName;
    }

    public contextType?: any;
    private _type: any;
    public set type(value: any) {
        this._type = value;
    } 
    public get type(): any {
        return this._type || this.contextType;
    }

    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER) protected typesHelper: TypesHelper) {
    }

    public get staticRouting(): Partial<RouteData<HttpEventProperties>> {
        return {
            eventType: HttpEvent.EventType
        };
    };

    public async extractValue(
        event: HttpEvent, 
        response: FlexibleResponse, 
        filterBinnacle: {
            [key: string]: string;
        }): Promise<any> {
        var value = this.extractValueFromHttpEvent(event, response, filterBinnacle);
        return this.typesHelper.castToType(value, this.type);
    }

    protected abstract extractValueFromHttpEvent(
        event: HttpEvent, 
        response: FlexibleResponse, 
        filterBinnacle: {
            [key: string]: string;
        }): Promise<any>;

}