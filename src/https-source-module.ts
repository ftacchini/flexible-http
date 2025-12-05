import {  FLEXIBLE_APP_TYPES, FlexibleEventSource } from "flexible-core";
import { ContainerModule, Container } from "inversify";
import { Application } from "express";
import * as https from 'https';
import { HTTP_SOURCE_TYPES } from "./http-source-types";
import { HttpModule } from "./http-module";
import { HttpsSource } from "./https-source";

export class HttpsSourceModule extends HttpModule {

    constructor(
        private port: number,
        private application: Application,
        private credentials: https.ServerOptions
    ) {
        super();
    }

    public get isolatedContainer(): ContainerModule {
        return new ContainerModule(() => {});
    }

    protected createInstance(container: Container): FlexibleEventSource {
        return new HttpsSource(
            container.get(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR),
            container.get(FLEXIBLE_APP_TYPES.LOGGER),
            this.port,
            this.credentials,
            this.application
        );
    }
}
