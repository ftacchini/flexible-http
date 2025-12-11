import { FlexibleEventSourceModule, FlexibleEventSource, FlexibleContainer } from "flexible-core";
import { DependencyContainer } from "tsyringe";
import { HttpModuleBuilder } from "./http-module-builder";
export declare abstract class HttpModule implements FlexibleEventSourceModule {
    static builder(): HttpModuleBuilder;
    private instanceCreated;
    register(container: DependencyContainer): void;
    registerIsolated(container: DependencyContainer): void;
    getInstance(container: FlexibleContainer): FlexibleEventSource;
    protected abstract createInstance(container: FlexibleContainer): FlexibleEventSource;
}
