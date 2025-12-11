import { FlexibleEventSource, FlexibleContainer } from "flexible-core";
import { Application } from "express";
import * as https from 'https';
import { HttpModule } from "./http-module";
export declare class HttpsSourceModule extends HttpModule {
    private port;
    private application;
    private credentials;
    constructor(port: number, application: Application, credentials: https.ServerOptions);
    protected createInstance(container: FlexibleContainer): FlexibleEventSource;
}
