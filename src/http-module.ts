import { FlexibleEventSourceModule, FlexibleEventSource, FlexibleContainer } from "flexible-core";
import { DependencyContainer } from "tsyringe";
import { HTTP_SOURCE_TYPES } from "./http-source-types";
import { TypesHelper } from "./helpers/types-helper";
import { ResponseProcessor } from "./helpers/response-processor";
import { RouteProcessor } from "./helpers/route-processor";
import { HttpModuleBuilder } from "./http-module-builder";

export abstract class HttpModule implements FlexibleEventSourceModule {

    /**
     * Creates a new builder for constructing HttpModule instances.
     * @returns A new HttpModuleBuilder instance
     */
    public static builder(): HttpModuleBuilder {
        return new HttpModuleBuilder();
    }

    private instanceCreated: boolean = false;

    public register(container: DependencyContainer): void {
        if (!container.isRegistered(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER)) {
            container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER, TypesHelper);
        }
        if (!container.isRegistered(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR)) {
            container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR, ResponseProcessor);
        }
        if (!container.isRegistered(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR)) {
            container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR, RouteProcessor);
        }
    }

    public registerIsolated(container: DependencyContainer): void {
        // Empty implementation - binding happens in getInstance
    }

    public getInstance(container: FlexibleContainer): FlexibleEventSource {
        // Create and bind the instance if not already done
        if (!this.instanceCreated) {
            const instance = this.createInstance(container);
            container.registerValue(HTTP_SOURCE_TYPES.HTTP_SOURCE, instance);
            this.instanceCreated = true;
        }
        return container.resolve<FlexibleEventSource>(HTTP_SOURCE_TYPES.HTTP_SOURCE);
    }

    protected abstract createInstance(container: FlexibleContainer): FlexibleEventSource;
}