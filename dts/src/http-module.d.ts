import { FlexibleEventSourceModule, FlexibleEventSource, FlexibleContainer } from "flexible-core";
import { DependencyContainer } from "tsyringe";
export declare abstract class HttpModule implements FlexibleEventSourceModule {
    static builder: () => any;
    private instanceCreated;
    register(container: DependencyContainer): void;
    registerIsolated(container: DependencyContainer): void;
    getInstance(container: FlexibleContainer): FlexibleEventSource;
    protected abstract createInstance(container: FlexibleContainer): FlexibleEventSource;
}
