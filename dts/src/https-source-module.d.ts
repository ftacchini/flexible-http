import { FlexibleEventSource } from "flexible-core";
import { ContainerModule, Container } from "inversify";
import { Application } from "express";
import * as https from 'https';
import { HttpModule } from "./http-module";
export declare class HttpsSourceModule extends HttpModule {
    private port;
    private application;
    private credentials;
    constructor(port: number, application: Application, credentials: https.ServerOptions);
    get isolatedContainer(): ContainerModule;
    protected createInstance(container: Container): FlexibleEventSource;
}
