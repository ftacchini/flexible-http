import { FlexibleEventSource, FlexibleContainer } from "flexible-core";
import { Application } from 'express';
import { HttpModule } from "../http-module";
import { HttpSourceConfig } from "./http-abstract-source";
export declare class HttpSourceModule extends HttpModule {
    private port;
    private application;
    private config?;
    constructor(port: number, application: Application, config?: HttpSourceConfig);
    protected createInstance(container: FlexibleContainer): FlexibleEventSource;
}
