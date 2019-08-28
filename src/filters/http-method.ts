import { FlexibleFilter, RouteData } from "flexible-core";
import { HttpEventProperties } from "../http-event-properties";
import { HttpEvent } from "../http-event";

export class HttpMethod implements FlexibleFilter {

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
    
    public get staticRouting(): Partial<RouteData<HttpEventProperties>> {
        return {
            eventType: HttpEvent.EventType,
            method: this.method,
            routeParts: this.path.split("/")
        };
    };

    public filterEvent(
        event: HttpEvent, 
        filterBinnacle: {
            [key: string]: string;
        }): boolean {
            
            filterBinnacle.path || (filterBinnacle.path = "");
            filterBinnacle.path += this._path; 

            return this.isLastFilter ? 
                event.data.path.startsWith(filterBinnacle.path) :
                event.data.path.startsWith(filterBinnacle.path);
    }
}