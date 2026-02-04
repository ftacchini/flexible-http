import "reflect-metadata";
import "jasmine";
import { HttpOption } from "../../../src/built-ins/filters/http-options";
import { HttpEvent } from "../../../src/http-event";
import { RouteProcessor } from "../../../src/helpers/route-processor";
import { Request, Response } from "express";

describe("HttpOption Filter Unit Tests", () => {
    let httpOption: HttpOption;
    let routeProcessor: RouteProcessor;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockHttpEvent: HttpEvent;
    let filterBinnacle: { [key: string]: string };

    beforeEach(() => {
        // Create real RouteProcessor instance
        routeProcessor = new RouteProcessor();

        // Create HttpOption filter instance
        httpOption = new HttpOption(routeProcessor);

        // Initialize filter binnacle
        filterBinnacle = {};

        // Create mock response
        mockResponse = {
            locals: {}
        } as any;
    });

    /**
     * Helper function to create a mock request with specified method and path
     */
    function createMockRequest(method: string, path: string): Partial<Request> {
        return {
            method: method,
            path: path,
            url: path,
            protocol: "http",
            httpVersion: "1.1",
            ip: "127.0.0.1",
            headers: {},
            get: function(name: string) {
                return this.headers[name.toLowerCase()];
            }
        } as any;
    }

    describe("Matching OPTIONS requests", () => {
        it("should return true for OPTIONS request matching the path", async () => {
            // Arrange
            const path = "/api";
            httpOption.path = path;
            httpOption.isLastFilter = true;
            mockRequest = createMockRequest("OPTIONS", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpOption.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for OPTIONS request with wildcard path", async () => {
            // Arrange
            const filterPath = "/api/:splat*";  // v6 syntax for wildcard
            const requestPath = "/api/users";
            httpOption.path = filterPath;
            httpOption.isLastFilter = true;
            mockRequest = createMockRequest("OPTIONS", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpOption.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for OPTIONS request with path parameters", async () => {
            // Arrange
            const filterPath = "/api/:resource";
            const requestPath = "/api/users";
            httpOption.path = filterPath;
            httpOption.isLastFilter = true;
            mockRequest = createMockRequest("OPTIONS", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpOption.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for OPTIONS request to root path", async () => {
            // Arrange
            const path = "/";
            httpOption.path = path;
            httpOption.isLastFilter = true;
            mockRequest = createMockRequest("OPTIONS", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpOption.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("Static routing configuration", () => {
        it("should have method set to 'options' in staticRouting", () => {
            // Arrange
            httpOption.path = "/api";

            // Act
            const staticRouting = httpOption.staticRouting;

            // Assert
            expect(staticRouting.method).toBe("options");
        });

        it("should include eventType in staticRouting", () => {
            // Arrange
            httpOption.path = "/api";

            // Act
            const staticRouting = httpOption.staticRouting;

            // Assert
            expect(staticRouting.eventType).toBeDefined();
        });

        it("should include route parts in staticRouting", () => {
            // Arrange
            httpOption.path = "/api/v1";

            // Act
            const staticRouting = httpOption.staticRouting;

            // Assert
            expect(staticRouting.routeParts).toBeDefined();
            expect(staticRouting.routeParts).toContain("api");
            expect(staticRouting.routeParts).toContain("v1");
        });
    });

    describe("Non-matching path", () => {
        it("should return false for different path", async () => {
            // Arrange
            const filterPath = "/api";
            const requestPath = "/users";
            httpOption.path = filterPath;
            httpOption.isLastFilter = true;
            mockRequest = createMockRequest("OPTIONS", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpOption.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false for partial path match when isLastFilter is true", async () => {
            // Arrange
            const filterPath = "/api";
            const requestPath = "/api/users";
            httpOption.path = filterPath;
            httpOption.isLastFilter = true;
            mockRequest = createMockRequest("OPTIONS", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpOption.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false when path parameter doesn't match pattern", async () => {
            // Arrange
            const filterPath = "/api/:resource/items";
            const requestPath = "/api/users";
            httpOption.path = filterPath;
            httpOption.isLastFilter = true;
            mockRequest = createMockRequest("OPTIONS", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpOption.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("Filter binnacle path composition", () => {
        it("should compose path in filter binnacle", async () => {
            // Arrange
            const path = "/api";
            httpOption.path = path;
            httpOption.isLastFilter = true;
            mockRequest = createMockRequest("OPTIONS", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            await httpOption.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(filterBinnacle.path).toBe(path);
        });

        it("should append to existing path in filter binnacle", async () => {
            // Arrange
            const existingPath = "/api";
            const filterPath = "/v1";
            const expectedPath = "/api/v1";
            filterBinnacle.path = existingPath;
            httpOption.path = filterPath;
            httpOption.isLastFilter = true;
            mockRequest = createMockRequest("OPTIONS", expectedPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpOption.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
            expect(filterBinnacle.path).toBe(expectedPath);
        });
    });

    describe("isLastFilter behavior", () => {
        it("should allow partial match when isLastFilter is false", async () => {
            // Arrange
            const filterPath = "/api";
            const requestPath = "/api/users";
            httpOption.path = filterPath;
            httpOption.isLastFilter = false;
            mockRequest = createMockRequest("OPTIONS", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpOption.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should require exact match when isLastFilter is true", async () => {
            // Arrange
            const filterPath = "/api";
            const requestPath = "/api/users";
            httpOption.path = filterPath;
            httpOption.isLastFilter = true;
            mockRequest = createMockRequest("OPTIONS", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpOption.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("Method property", () => {
        it("should have method set to 'options'", () => {
            // Assert
            expect(httpOption.method).toBe("options");
        });
    });
});
