import { FlexibleExtractor, RouteData, FlexibleResponse } from "flexible-core";
import { HttpEventProperties } from "../../http-event-properties";
import { HttpEvent } from "../../http-event";
import { TypesHelper } from "../../helpers/types-helper";
export declare abstract class HttpExtractor implements FlexibleExtractor {
    protected typesHelper: TypesHelper;
    contextName?: string;
    private _name;
    set name(value: string);
    get name(): string;
    contextType?: any;
    private _type;
    set type(value: any);
    get type(): any;
    constructor(typesHelper: TypesHelper);
    get staticRouting(): Partial<RouteData<HttpEventProperties>>;
    extractValue(event: HttpEvent, response: FlexibleResponse, filterBinnacle: {
        [key: string]: string;
    }, contextBinnacle: {
        [key: string]: any;
    }): Promise<any>;
    protected abstract extractValueFromHttpEvent(event: HttpEvent, response: FlexibleResponse, filterBinnacle: {
        [key: string]: string;
    }, contextBinnacle: {
        [key: string]: any;
    }): Promise<any>;
}
