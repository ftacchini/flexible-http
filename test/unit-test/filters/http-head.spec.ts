import "reflect-metadata";
import "jasmine";
import { HttpHead } from "../../../src/filters/http-head";
import { HttpEvent } from "../../../src/http-event";
import { RouteProcessor } from "../../../src/helpers/route-processor";
import { Request, Response } from "express";

describe("HttpHead Filter Unit Tests", () => {
    let httpHead: HttpHead;
    let routeProcessor: RouteProcessor;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockHttpEvent: HttpEvent;
    let filterBinnacle: { [key: string]: string };

    beforeEach(() => {
        // Create real RouteProcessor instance
        routeProcessor = new RouteProcessor();

        // Create HttpHead filter instance
        httpHead = new HttpHead(routeProcessor);

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

    describe("Matching HEAD requests", () => {
        it("should return true for HEAD request matching the path", async () => {
            // Arrange
            const path = "/health";
            httpHead.path = path;
            httpHead.isLastFilter = true;
            mockRequest = createMockRequest("HEAD", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpHead.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for HEAD request with path parameters", async () => {
            // Arrange
            const filterPath = "/users/:id";
            const requestPath = "/users/123";
            httpHead.path = filterPath;
            httpHead.isLastFilter = true;
            mockRequest = createMockRequest("HEAD", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpHead.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for HEAD request with multiple path parameters", async () => {
            // Arrange
            const filterPath = "/files/:category/:fileId";
            const requestPath = "/files/documents/789";
            httpHead.path = filterPath;
            httpHead.isLastFilter = true;
            mockRequest = createMockRequest("HEAD", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpHead.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for HEAD request to root path", async () => {
            // Arrange
            const path = "/";
            httpHead.path = path;
            httpHead.isLastFilter = true;
            mockRequest = createMockRequest("HEAD", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpHead.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("Static routing configuration", () => {
        it("should have method set to 'head' in staticRouting", () => {
            // Arrange
            httpHead.path = "/health";

            // Act
            const staticRouting = httpHead.staticRouting;

            // Assert
            expect(staticRouting.method).toBe("head");
        });

        it("should include eventType in staticRouting", () => {
            // Arrange
            httpHead.path = "/health";

            // Act
            const staticRouting = httpHead.staticRouting;

            // Assert
            expect(staticRouting.eventType).toBeDefined();
        });

        it("should include route parts in staticRouting", () => {
            // Arrange
            httpHead.path = "/health/status";

            // Act
            const staticRouting = httpHead.staticRouting;

            // Assert
            expect(staticRouting.routeParts).toBeDefined();
            expect(staticRouting.routeParts).toContain("health");
            expect(staticRouting.routeParts).toContain("status");
        });
    });

    describe("Non-matching path", () => {
        it("should return false for different path", async () => {
            // Arrange
            const filterPath = "/health";
            const requestPath = "/status";
            httpHead.path = filterPath;
            httpHead.isLastFilter = true;
            mockRequest = createMockRequest("HEAD", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpHead.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false for partial path match when isLastFilter is true", async () => {
            // Arrange
            const filterPath = "/api";
            const requestPath = "/api/health";
            httpHead.path = filterPath;
            httpHead.isLastFilter = true;
            mockRequest = createMockRequest("HEAD", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpHead.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false when path parameter doesn't match pattern", async () => {
            // Arrange
            const filterPath = "/users/:id/status";
            const requestPath = "/users/123";
            httpHead.path = filterPath;
            httpHead.isLastFilter = true;
            mockRequest = createMockRequest("HEAD", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpHead.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("Filter binnacle path composition", () => {
        it("should compose path in filter binnacle", async () => {
            // Arrange
            const path = "/health";
            httpHead.path = path;
            httpHead.isLastFilter = true;
            mockRequest = createMockRequest("HEAD", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            await httpHead.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(filterBinnacle.path).toBe(path);
        });

        it("should append to existing path in filter binnacle", async () => {
            // Arrange
            const existingPath = "/api";
            const filterPath = "/health";
            const expectedPath = "/api/health";
            filterBinnacle.path = existingPath;
            httpHead.path = filterPath;
            httpHead.isLastFilter = true;
            mockRequest = createMockRequest("HEAD", expectedPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpHead.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
            expect(filterBinnacle.path).toBe(expectedPath);
        });
    });

    describe("isLastFilter behavior", () => {
        it("should allow partial match when isLastFilter is false", async () => {
            // Arrange
            const filterPath = "/api";
            const requestPath = "/api/health";
            httpHead.path = filterPath;
            httpHead.isLastFilter = false;
            mockRequest = createMockRequest("HEAD", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpHead.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should require exact match when isLastFilter is true", async () => {
            // Arrange
            const filterPath = "/api";
            const requestPath = "/api/health";
            httpHead.path = filterPath;
            httpHead.isLastFilter = true;
            mockRequest = createMockRequest("HEAD", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpHead.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("Method property", () => {
        it("should have method set to 'head'", () => {
            // Assert
            expect(httpHead.method).toBe("head");
        });
    });
});
