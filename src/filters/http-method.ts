import { FlexibleFilter, RouteData } from "flexible-core";
import { HttpEventProperties } from "../http-event-properties";
import { HttpEvent } from "../http-event";
import { injectable, inject } from "inversify";
import { HTTP_SOURCE_TYPES } from "../http-source-types";
import * as PathToRegex from "path-to-regexp";
import { flatten } from "lodash";

@injectable()
export class HttpMethod implements FlexibleFilter {

    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) protected routeProcessor: typeof PathToRegex) {
    }

    public isLastFilter: boolean;
    public contextName: string;
    public method: string;

    private _path: string;
    public set path(value: string) {
        this._path = value;
    }

    public get path() {
        return this._path ? this._path : ("/" + this.contextName)
    }

    private _pathTokens: PathToRegex.Token[];
    private get pathTokens(): PathToRegex.Token[] {
        if(!this._pathTokens) {
            this._pathTokens = this.routeProcessor.parse(this._path);
        }

        return this._pathTokens;
    }
    
    public get staticRouting(): Partial<RouteData<HttpEventProperties>> {
        return {
            eventType: HttpEvent.EventType,
            method: this.method,
            routeParts: flatten(this.pathTokens
                .filter((token: PathToRegex.Key) => !token.pattern)
                .map((token: string) => token.split("/")))
        };
    };

    public async filterEvent(
        event: HttpEvent, 
        filterBinnacle: {
            [key: string]: string;
        }): Promise<boolean> {

            filterBinnacle.path ? (filterBinnacle.path += this._path) : (filterBinnacle.path = this.path);

            const regex = PathToRegex(filterBinnacle.path, null, {
                start: !this.isLastFilter,
                end: this.isLastFilter
            });
            
            return regex.test(event.data.path);
    }
}