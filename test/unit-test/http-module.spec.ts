import "reflect-metadata";
import "jasmine";
import { container as globalContainer, DependencyContainer } from "tsyringe";
import { FlexibleContainer, FLEXIBLE_APP_TYPES } from "flexible-core";
import { HTTP_SOURCE_TYPES } from "../../src/http-source-types";
import { TypesHelper } from "../../src/helpers/types-helper";
import { ResponseProcessor } from "../../src/helpers/response-processor";
import { RouteProcessor } from "../../src/helpers/route-processor";

describe("HttpModule Dependencies", () => {
    let container: DependencyContainer;
    let flexibleContainer: FlexibleContainer;

    beforeEach(() => {
        container = globalContainer.createChildContainer();
        flexibleContainer = new FlexibleContainer(container);
    });

    describe("Helper Dependencies Registration", () => {
        it("should register TypesHelper", () => {
            // Act
            container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER, TypesHelper);

            // Assert
            expect(container.isRegistered(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER)).toBe(true);
            const helper = container.resolve(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER);
            expect(helper).toBeInstanceOf(TypesHelper);
        });

        it("should register ResponseProcessor", () => {
            // Arrange - ResponseProcessor needs logger
            const mockLogger = {
                debug: jasmine.createSpy('debug'),
                info: jasmine.createSpy('info'),
                warn: jasmine.createSpy('warn'),
                error: jasmine.createSpy('error')
            };
            container.register(FLEXIBLE_APP_TYPES.LOGGER, { useValue: mockLogger });

            // Act
            container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR, ResponseProcessor);

            // Assert
            expect(container.isRegistered(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR)).toBe(true);
            const processor = container.resolve(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR);
            expect(processor).toBeInstanceOf(ResponseProcessor);
        });

        it("should register RouteProcessor", () => {
            // Act
            container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR, RouteProcessor);

            // Assert
            expect(container.isRegistered(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR)).toBe(true);
            const processor = container.resolve(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR);
            expect(processor).toBeInstanceOf(RouteProcessor);
        });

        it("should share singleton instances", () => {
            // Arrange
            container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER, TypesHelper);

            // Act
            const helper1 = container.resolve(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER);
            const helper2 = container.resolve(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER);

            // Assert
            expect(helper1).toBe(helper2);
        });

        it("should not re-register if already registered", () => {
            // Arrange
            const customTypesHelper = new TypesHelper();
            container.register(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER, { useValue: customTypesHelper });

            // Act - Try to register singleton (should not override)
            if (!container.isRegistered(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER)) {
                container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER, TypesHelper);
            }

            // Assert
            const resolvedHelper = container.resolve(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER);
            expect(resolvedHelper).toBe(customTypesHelper);
        });
    });

    describe("Module Registration Pattern", () => {
        it("should register all HTTP module dependencies", () => {
            // Arrange - Mock logger for ResponseProcessor
            const mockLogger = {
                debug: jasmine.createSpy('debug'),
                info: jasmine.createSpy('info'),
                warn: jasmine.createSpy('warn'),
                error: jasmine.createSpy('error')
            };
            container.register(FLEXIBLE_APP_TYPES.LOGGER, { useValue: mockLogger });

            // Act - Simulate HttpModule.register() method
            if (!container.isRegistered(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER)) {
                container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER, TypesHelper);
            }
            if (!container.isRegistered(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR)) {
                container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR, ResponseProcessor);
            }
            if (!container.isRegistered(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR)) {
                container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR, RouteProcessor);
            }

            // Assert
            expect(container.isRegistered(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER)).toBe(true);
            expect(container.isRegistered(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR)).toBe(true);
            expect(container.isRegistered(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR)).toBe(true);

            // Verify they can be resolved
            const typesHelper = container.resolve(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER);
            const responseProcessor = container.resolve(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR);
            const routeProcessor = container.resolve(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR);

            expect(typesHelper).toBeInstanceOf(TypesHelper);
            expect(responseProcessor).toBeInstanceOf(ResponseProcessor);
            expect(routeProcessor).toBeInstanceOf(RouteProcessor);
        });
    });
});