import { FlexibleFilter, RouteData } from "flexible-core";
import { HttpEventProperties } from "../http-event-properties";
import { HttpEvent } from "../http-event";
import { injectable, inject } from "inversify";
import { HTTP_SOURCE_TYPES } from "../http-source-types";
import { Key } from "path-to-regexp";
import { flatten } from "lodash";
import { RouteProcessor } from "../helpers/route-processor";

@injectable()
export class HttpMethod implements FlexibleFilter {

    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) protected routeProcessor: RouteProcessor) {
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

    private _pathTokens: any[];
    private get pathTokens(): any[] {
        if(!this._pathTokens) {
            this._pathTokens = this.routeProcessor.parse(this.path);
        }

        return this._pathTokens;
    }

    public get staticRouting(): Partial<RouteData<HttpEventProperties>> {
        return {
            eventType: HttpEvent.EventType,
            method: this.method,
            routeParts: flatten(this.pathTokens
                .filter((token: any) => typeof token === 'string')
                .map((token: string) => token.split("/")))
                .filter((p: string) => p) // Remove empty strings
        };
    };

    public async filterEvent(
        event: HttpEvent,
        filterBinnacle: {
            [key: string]: string;
        }): Promise<boolean> {

            filterBinnacle.path ? (filterBinnacle.path += this.path) : (filterBinnacle.path = this.path);

            const regex = this.routeProcessor.pathToRegexp(filterBinnacle.path, null, {
                start: !this.isLastFilter,
                end: this.isLastFilter
            });

            return regex.test(event.data.request.path);
    }
}