import "reflect-metadata";
import "jasmine";
import { container as globalContainer, DependencyContainer } from "tsyringe";
import { FromBody } from "../../src/built-ins/extractors/from-body";
import { FromHeaders } from "../../src/built-ins/extractors/from-headers";
import { FromQuery } from "../../src/built-ins/extractors/from-query";
import { FromPath } from "../../src/built-ins/extractors/from-path";
import { FromLocals } from "../../src/built-ins/extractors/from-locals";
import { HTTP_SOURCE_TYPES } from "../../src/http-source-types";
import { TypesHelper } from "../../src/helpers/types-helper";

describe("Extractor Registration", () => {
    let container: DependencyContainer;

    beforeEach(() => {
        container = globalContainer.createChildContainer();
        // Register TypesHelper as it's required by extractors
        container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER, TypesHelper);
    });

    it("should register and resolve FromBody extractor", () => {
        // Arrange
        container.registerSingleton("FromBody", FromBody);

        // Act
        const extractor = container.resolve<FromBody>("FromBody");

        // Assert
        expect(extractor).toBeInstanceOf(FromBody);
        expect(extractor.extractValue).toBeDefined();
    });

    it("should register and resolve FromHeaders extractor", () => {
        // Arrange
        container.registerSingleton("FromHeaders", FromHeaders);

        // Act
        const extractor = container.resolve<FromHeaders>("FromHeaders");

        // Assert
        expect(extractor).toBeInstanceOf(FromHeaders);
        expect(extractor.extractValue).toBeDefined();
    });

    it("should register and resolve FromQuery extractor", () => {
        // Arrange
        container.registerSingleton("FromQuery", FromQuery);

        // Act
        const extractor = container.resolve<FromQuery>("FromQuery");

        // Assert
        expect(extractor).toBeInstanceOf(FromQuery);
        expect(extractor.extractValue).toBeDefined();
    });

    it("should register and resolve FromPath extractor", () => {
        // Arrange
        const { RouteProcessor } = require("../../src/helpers/route-processor");
        container.registerSingleton(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR, RouteProcessor);
        container.registerSingleton("FromPath", FromPath);

        // Act
        const extractor = container.resolve<FromPath>("FromPath");

        // Assert
        expect(extractor).toBeInstanceOf(FromPath);
        expect(extractor.extractValue).toBeDefined();
    });

    it("should register and resolve FromLocals extractor", () => {
        // Arrange
        container.registerSingleton("FromLocals", FromLocals);

        // Act
        const extractor = container.resolve<FromLocals>("FromLocals");

        // Assert
        expect(extractor).toBeInstanceOf(FromLocals);
        expect(extractor.extractValue).toBeDefined();
    });

    it("should inject TypesHelper into extractors", () => {
        // Arrange
        container.registerSingleton("FromBody", FromBody);

        // Act
        const extractor = container.resolve<FromBody>("FromBody");

        // Assert
        expect(extractor).toBeInstanceOf(FromBody);
        // The extractor should have received the TypesHelper dependency
        expect((extractor as any).typesHelper).toBeInstanceOf(TypesHelper);
    });

    it("should share TypesHelper singleton across extractors", () => {
        // Arrange
        container.registerSingleton("FromBody", FromBody);
        container.registerSingleton("FromHeaders", FromHeaders);

        // Act
        const bodyExtractor = container.resolve<FromBody>("FromBody");
        const headersExtractor = container.resolve<FromHeaders>("FromHeaders");

        // Assert
        const bodyTypesHelper = (bodyExtractor as any).typesHelper;
        const headersTypesHelper = (headersExtractor as any).typesHelper;
        expect(bodyTypesHelper).toBe(headersTypesHelper);
    });
});