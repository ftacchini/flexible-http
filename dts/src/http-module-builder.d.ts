import express from "express";
import * as https from 'https';
import { HttpModule } from "./http-module";
import { HttpSourceConfig } from "./http-abstract-source";
export declare class HttpModuleBuilder {
    private port;
    private application;
    private credentials;
    private config;
    constructor();
    withPort(port: number): this;
    withCredentials(credentials: https.ServerOptions): this;
    withApplication(application: express.Application): this;
    withConfig(config: HttpSourceConfig): this;
    build(): HttpModule;
    reset(): void;
}
