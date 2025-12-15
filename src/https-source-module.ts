import {  FLEXIBLE_APP_TYPES, FlexibleEventSource, FlexibleContainer } from "flexible-core";
import { DependencyContainer } from "tsyringe";
import { Application } from "express";
import * as https from 'https';
import { HTTP_SOURCE_TYPES } from "./http-source-types";
import { HttpModule } from "./http-module";
import { HttpsSource } from "./https-source";
import { HttpSourceConfig } from "./http-abstract-source";

export class HttpsSourceModule extends HttpModule {

    constructor(
        private port: number,
        private application: Application,
        private credentials: https.ServerOptions,
        private config?: HttpSourceConfig
    ) {
        super();
    }

    protected createInstance(container: FlexibleContainer): FlexibleEventSource {
        return new HttpsSource(
            container.resolve(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR),
            container.resolve(FLEXIBLE_APP_TYPES.LOGGER),
            this.port,
            this.credentials,
            this.application,
            this.config
        );
    }
}
