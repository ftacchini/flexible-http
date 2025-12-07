import express from "express";
import * as https from 'https';
import { HttpModule } from "./http-module";
export declare class HttpModuleBuilder {
    private port;
    private application;
    private credentials;
    private static _instance;
    static get instance(): HttpModuleBuilder;
    private constructor();
    withPort(port: number): this;
    withCredentials(credentials: https.ServerOptions): this;
    withApplication(application: express.Application): this;
    build(): HttpModule;
    reset(): void;
}
