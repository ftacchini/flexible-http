import { FlexibleEventSource, FlexibleContainer } from "flexible-core";
import { Application } from "express";
import * as https from 'https';
import { HttpModule } from "../http-module";
import { HttpSourceConfig } from "./http-abstract-source";
export declare class HttpsSourceModule extends HttpModule {
    private port;
    private application;
    private credentials;
    private config?;
    constructor(port: number, application: Application, credentials: https.ServerOptions, config?: HttpSourceConfig);
    protected createInstance(container: FlexibleContainer): FlexibleEventSource;
}
