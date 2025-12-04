import { HttpSourceModule } from "./http-source-module";
import express from "express";
import * as https from 'https';
import { HttpsSourceModule } from "./https-source-module";
import { HttpModule } from "./http-module";


const DEFAULT_HTTP_PORT: number = 8080;
const DEFAULT_HTTPS_PORT: number = 8443;

export class HttpModuleBuilder {

    private port: number;
    private application: express.Application;
    private credentials: https.ServerOptions;


    private static _instance: HttpModuleBuilder;
    public static get instance() {
        return this._instance || (this._instance = new HttpModuleBuilder());
    }

    private constructor() {
        this.reset();
    }

    public withPort(port: number): this {
        this.port = port;
        return this;
    }

    public withCredentials(credentials: https.ServerOptions): this {
        this.credentials = credentials;
        return this;
    }

    public withApplication(application: express.Application): this {
        this.application = application;
        return this;
    }

    public build() {

        let httpModule: HttpModule;
        let application: express.Application = this.application || express();

        if(this.credentials){
            httpModule =  new HttpsSourceModule(
                this.port || DEFAULT_HTTPS_PORT,
                application,
                this.credentials
            )
        }
        else {
            httpModule =  new HttpSourceModule(
                this.port || DEFAULT_HTTP_PORT,
                application
            )
        }

        this.reset();
        return httpModule;
    }

    public reset() {
        this.port = null;
        this.application = null;
        this.credentials = null;
    }
}