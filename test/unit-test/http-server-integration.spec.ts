import "reflect-metadata";
import "jasmine";
import { container as globalContainer, DependencyContainer } from "tsyringe";
import { FlexibleContainer, FLEXIBLE_APP_TYPES } from "flexible-core";
import { HTTP_SOURCE_TYPES } from "../../src/http-source-types";
import { TypesHelper } from "../../src/helpers/types-helper";
import { ResponseProcessor } from "../../src/helpers/response-processor";
import { RouteProcessor } from "../../src/helpers/route-processor";

describe("HTTP Server Integration", () => {
    let container: DependencyContainer;
    let flexibleContainer: FlexibleContainer;
    let mockLogger: any;

    beforeEach(() => {
        container = globalContainer.createChildContainer();
        flexibleContainer = new FlexibleContainer(container);

        // Mock logger with all required methods
        mockLogger = {
            emergency: jasmine.createSpy('emergency'),
            alert: jasmine.createSpy('alert'),
            crit: jasmine.createSpy('crit'),
            error: jasmine.createSpy('error'),
            warning: jasmine.createSpy('warning'),
            notice: jasmine.createSpy('notice'),
            info: jasmine.createSpy('info'),
            debug: jasmine.createSpy('debug')
        };
        container.register(FLEXIBLE_APP_TYPES.LOGGER, { useValue: mockLogger });

        // Register required dependencies
        container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER, TypesHelper);
        container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR, ResponseProcessor);
        container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR, RouteProcessor);
    });

    describe("Dependency Resolution", () => {
        it("should resolve all required dependencies for HTTP sources", () => {
            // Act
            const typesHelper = container.resolve(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER);
            const responseProcessor = container.resolve(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR);
            const routeProcessor = container.resolve(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR);
            const logger = container.resolve(FLEXIBLE_APP_TYPES.LOGGER);

            // Assert
            expect(typesHelper).toBeInstanceOf(TypesHelper);
            expect(responseProcessor).toBeInstanceOf(ResponseProcessor);
            expect(routeProcessor).toBeInstanceOf(RouteProcessor);
            expect(logger).toBe(mockLogger);
        });

        it("should share singleton dependencies", () => {
            // Act
            const typesHelper1 = container.resolve(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER);
            const typesHelper2 = container.resolve(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER);

            // Assert
            expect(typesHelper1).toBe(typesHelper2);
        });

        it("should inject logger into ResponseProcessor", () => {
            // Act
            const responseProcessor = container.resolve<ResponseProcessor>(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR);

            // Assert
            expect(responseProcessor).toBeInstanceOf(ResponseProcessor);
            // The logger should have been injected (we can't directly test private field, but constructor should not throw)
        });

        it("should create HTTP module dependencies without errors", () => {
            // This test simulates what HttpModule.register() does

            // Act & Assert - Should not throw
            expect(() => {
                if (!container.isRegistered(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER)) {
                    container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER, TypesHelper);
                }
                if (!container.isRegistered(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR)) {
                    container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR, ResponseProcessor);
                }
                if (!container.isRegistered(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR)) {
                    container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR, RouteProcessor);
                }
            }).not.toThrow();

            // Verify all dependencies are registered
            expect(container.isRegistered(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER)).toBe(true);
            expect(container.isRegistered(HTTP_SOURCE_TYPES.HTTP_RESPONSE_PROCESSOR)).toBe(true);
            expect(container.isRegistered(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR)).toBe(true);
        });

        it("should handle FlexibleContainer wrapper correctly", () => {
            // Act
            flexibleContainer.registerValue("TEST_TOKEN", "test-value");
            const resolved = flexibleContainer.resolve("TEST_TOKEN");

            // Assert
            expect(resolved).toBe("test-value");
        });
    });
});