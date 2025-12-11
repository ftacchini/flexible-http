import { FLEXIBLE_APP_TYPES, FlexibleEventSource, FlexibleContainer } from "flexible-core";
import { DependencyContainer } from "tsyringe";
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

    protected createInstance(container: FlexibleContainer): FlexibleEventSource {
        return new HttpSource(
            container.resolve(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR),
            container.resolve(FLEXIBLE_APP_TYPES.LOGGER),
            this.port,
            this.application
        );
    }
}