import { FlexibleEventSourceModule, FlexibleEventSource } from "flexible-core";
import { Container, AsyncContainerModule, interfaces } from "inversify";
import * as express from 'express';
import * as https from 'https';
import { HTTP_SOURCE_TYPES } from "./http-source-types";
import { HttpSource } from "./http-source";
import { HttpsSource } from "./https-source";

export class HttpSourceModule implements FlexibleEventSourceModule {

    constructor(
        private port: number,
        private application: express.Application,
        private credentials: https.ServerOptions,
    ) {

    }

    public get isolatedContainer(): AsyncContainerModule {
        var module =  new AsyncContainerModule(async (
            bind: interfaces.Bind,
            unbind: interfaces.Unbind,
            isBound: interfaces.IsBound,
            rebind: interfaces.Rebind) => {
            
            if(this.credentials) {
                isBound(HTTP_SOURCE_TYPES.HTTP_SOURCE) || 
                    bind(HTTP_SOURCE_TYPES.HTTP_SOURCE).toDynamicValue(() => {
                        return new HttpSource(this.port, this.application);
                    });
            }
            else {
                isBound(HTTP_SOURCE_TYPES.HTTP_SOURCE) || 
                    bind(HTTP_SOURCE_TYPES.HTTP_SOURCE).toDynamicValue(() => {
                        return new HttpsSource(this.port, this.credentials, this.application);
                    });
            }
        });

        return module;
    }

    public get container(): AsyncContainerModule {
        var module =  new AsyncContainerModule(async (
            bind: interfaces.Bind,
            unbind: interfaces.Unbind,
            isBound: interfaces.IsBound,
            rebind: interfaces.Rebind) => {
        });

        return module;
    }
    
    public getInstance(container: Container): FlexibleEventSource {
        return container.get(HTTP_SOURCE_TYPES.HTTP_SOURCE);
    }

}