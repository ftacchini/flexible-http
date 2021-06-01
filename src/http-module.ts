import { FlexibleEventSourceModule, FlexibleEventSource } from "flexible-core";
import { AsyncContainerModule, interfaces, Container } from "inversify";
import { HTTP_SOURCE_TYPES } from "./http-source-types";
import { TypesHelper } from "./helpers/types-helper";
import * as PathToRegex from "path-to-regexp";
import { ResponseProcessor } from "./helpers/response-processor";

export abstract class HttpModule implements FlexibleEventSourceModule {
    
    readonly abstract isolatedContainer: AsyncContainerModule;

    public get container(): AsyncContainerModule {
        var module =  new AsyncContainerModule(async (
            bind: interfaces.Bind,
            unbind: interfaces.Unbind,
            isBound: interfaces.IsBound,
            rebind: interfaces.Rebind) => {
        
            isBound(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER) || bind(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER).to(TypesHelper).inSingletonScope();
            isBound(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR) || bind(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR).to(ResponseProcessor).inSingletonScope();
            isBound(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) || bind(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR).toConstantValue(PathToRegex);

        });

        return module;
    }
    
    public getInstance(container: Container): FlexibleEventSource {
        return container.get(HTTP_SOURCE_TYPES.HTTP_SOURCE);
    }
}