import { FlexibleEventSource } from "flexible-core";
import { ContainerModule, Container } from "inversify";
import { Application } from 'express';
import { HttpModule } from "./http-module";
export declare class HttpSourceModule extends HttpModule {
    private port;
    private application;
    constructor(port: number, application: Application);
    get isolatedContainer(): ContainerModule;
    protected createInstance(container: Container): FlexibleEventSource;
}
