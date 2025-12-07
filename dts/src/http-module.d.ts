import { FlexibleEventSourceModule, FlexibleEventSource } from "flexible-core";
import { ContainerModule, Container } from "inversify";
export declare abstract class HttpModule implements FlexibleEventSourceModule {
    readonly abstract isolatedContainer: ContainerModule;
    private instanceCreated;
    get container(): ContainerModule;
    getInstance(container: Container): FlexibleEventSource;
    protected abstract createInstance(container: Container): FlexibleEventSource;
}
