import { FLEXIBLE_APP_TYPES } from "flexible-core";
import { AsyncContainerModule, interfaces } from "inversify";
import { Application } from 'express';
import { HTTP_SOURCE_TYPES } from "./http-source-types";
import { HttpSource } from "./http-source";
import { HttpModule } from "./http-module";

export class HttpSourceModule extends HttpModule {

    constructor(
        private port: number,
        private application: Application
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
                    return new HttpSource(
                        context.container.get(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR),
                        context.container.get(FLEXIBLE_APP_TYPES.LOGGER), 
                        this.port, 
                        this.application);
                });
            
        });

        return module;
    }
}