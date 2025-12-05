import { FlexibleEventSourceModule, FlexibleEventSource } from "flexible-core";
import { ContainerModule, Container } from "inversify";
import { HTTP_SOURCE_TYPES } from "./http-source-types";
import { TypesHelper } from "./helpers/types-helper";
import { ResponseProcessor } from "./helpers/response-processor";
import { RouteProcessor } from "./helpers/route-processor";

export abstract class HttpModule implements FlexibleEventSourceModule {

    readonly abstract isolatedContainer: ContainerModule;
    private instanceCreated: boolean = false;

    public get container(): ContainerModule {
        var module =  new ContainerModule(({ bind, unbind, isBound, rebind }) => {
            isBound(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER) || bind(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER).to(TypesHelper).inSingletonScope();
            isBound(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR) || bind(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR).to(ResponseProcessor).inSingletonScope();
            isBound(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) || bind(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR).to(RouteProcessor).inSingletonScope();
        });

        return module;
    }

    public getInstance(container: Container): FlexibleEventSource {
        // Create and bind the instance if not already done
        if (!this.instanceCreated) {
            const instance = this.createInstance(container);
            container.bind(HTTP_SOURCE_TYPES.HTTP_SOURCE).toConstantValue(instance);
            this.instanceCreated = true;
        }
        return container.get<FlexibleEventSource>(HTTP_SOURCE_TYPES.HTTP_SOURCE);
    }

    protected abstract createInstance(container: Container): FlexibleEventSource;
}