import { FLEXIBLE_APP_TYPES, FlexibleEventSource } from "flexible-core";
import { ContainerModule, Container } from "inversify";
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

    public get isolatedContainer(): ContainerModule {
        // Empty module - binding happens in getInstance
        return new ContainerModule(() => {});
    }

    protected createInstance(container: Container): FlexibleEventSource {
        return new HttpSource(
            container.get(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR),
            container.get(FLEXIBLE_APP_TYPES.LOGGER),
            this.port,
            this.application
        );
    }
}