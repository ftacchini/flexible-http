import {  FLEXIBLE_APP_TYPES } from "flexible-core";
import { AsyncContainerModule, interfaces } from "inversify";
import * as express from 'express';
import * as https from 'https';
import { HTTP_SOURCE_TYPES } from "./http-source-types";
import { HttpModule } from "./http-module";
import { HttpsSource } from "./https-source";

export class HttpsSourceModule extends HttpModule {

    constructor(
        private port: number,
        private application: express.Application,
        private credentials: https.ServerOptions
    ) {
        super();
    }

    public get isolatedContainer(): AsyncContainerModule {
        var module =  new AsyncContainerModule(async (
            bind: interfaces.Bind,
            unbind: interfaces.Unbind,
            isBound: interfaces.IsBound,
            rebind: interfaces.Rebind) => {
            
            isBound(HTTP_SOURCE_TYPES.HTTP_SOURCE) || 
                bind(HTTP_SOURCE_TYPES.HTTP_SOURCE).toDynamicValue((context) => {
                    return new HttpsSource(
                        context.container.get(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR),
                        context.container.get(FLEXIBLE_APP_TYPES.LOGGER), 
                        this.port, 
                        this.credentials, 
                        this.application);
                });
            });
        return module;
    }

}