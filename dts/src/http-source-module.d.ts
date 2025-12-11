import { FlexibleEventSource, FlexibleContainer } from "flexible-core";
import { Application } from 'express';
import { HttpModule } from "./http-module";
export declare class HttpSourceModule extends HttpModule {
    private port;
    private application;
    constructor(port: number, application: Application);
    protected createInstance(container: FlexibleContainer): FlexibleEventSource;
}
