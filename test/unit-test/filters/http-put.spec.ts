import "reflect-metadata";
import "jasmine";
import { HttpPut } from "../../../src/built-ins/filters/http-put";
import { HttpEvent } from "../../../src/http-event";
import { RouteProcessor } from "../../../src/helpers/route-processor";
import { Request, Response } from "express";

describe("HttpPut Filter Unit Tests", () => {
    let httpPut: HttpPut;
    let routeProcessor: RouteProcessor;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockHttpEvent: HttpEvent;
    let filterBinnacle: { [key: string]: string };

    beforeEach(() => {
        // Create real RouteProcessor instance
        routeProcessor = new RouteProcessor();

        // Create HttpPut filter instance
        httpPut = new HttpPut(routeProcessor);

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

    describe("Matching PUT requests", () => {
        it("should return true for PUT request matching the path", async () => {
            // Arrange
            const path = "/users/123";
            httpPut.path = path;
            httpPut.isLastFilter = true;
            mockRequest = createMockRequest("PUT", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPut.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for PUT request with path parameters", async () => {
            // Arrange
            const filterPath = "/users/:id";
            const requestPath = "/users/123";
            httpPut.path = filterPath;
            httpPut.isLastFilter = true;
            mockRequest = createMockRequest("PUT", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPut.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for PUT request with multiple path parameters", async () => {
            // Arrange
            const filterPath = "/organizations/:orgId/users/:userId";
            const requestPath = "/organizations/456/users/123";
            httpPut.path = filterPath;
            httpPut.isLastFilter = true;
            mockRequest = createMockRequest("PUT", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPut.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for PUT request to root path", async () => {
            // Arrange
            const path = "/";
            httpPut.path = path;
            httpPut.isLastFilter = true;
            mockRequest = createMockRequest("PUT", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPut.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("Static routing configuration", () => {
        it("should have method set to 'put' in staticRouting", () => {
            // Arrange
            httpPut.path = "/users/:id";

            // Act
            const staticRouting = httpPut.staticRouting;

            // Assert
            expect(staticRouting.method).toBe("put");
        });

        it("should include eventType in staticRouting", () => {
            // Arrange
            httpPut.path = "/users/:id";

            // Act
            const staticRouting = httpPut.staticRouting;

            // Assert
            expect(staticRouting.eventType).toBeDefined();
        });

        it("should include route parts in staticRouting", () => {
            // Arrange
            httpPut.path = "/users/:id/profile";

            // Act
            const staticRouting = httpPut.staticRouting;

            // Assert
            expect(staticRouting.routeParts).toBeDefined();
            expect(staticRouting.routeParts).toContain("users");
            expect(staticRouting.routeParts).toContain("profile");
        });
    });

    describe("Non-matching path", () => {
        it("should return false for different path", async () => {
            // Arrange
            const filterPath = "/users/:id";
            const requestPath = "/posts/123";
            httpPut.path = filterPath;
            httpPut.isLastFilter = true;
            mockRequest = createMockRequest("PUT", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPut.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false for partial path match when isLastFilter is true", async () => {
            // Arrange
            const filterPath = "/users";
            const requestPath = "/users/123";
            httpPut.path = filterPath;
            httpPut.isLastFilter = true;
            mockRequest = createMockRequest("PUT", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPut.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false when path parameter doesn't match pattern", async () => {
            // Arrange
            const filterPath = "/users/:id/posts";
            const requestPath = "/users/123";
            httpPut.path = filterPath;
            httpPut.isLastFilter = true;
            mockRequest = createMockRequest("PUT", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPut.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("Filter binnacle path composition", () => {
        it("should compose path in filter binnacle", async () => {
            // Arrange
            const path = "/users/123";
            httpPut.path = path;
            httpPut.isLastFilter = true;
            mockRequest = createMockRequest("PUT", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            await httpPut.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(filterBinnacle.path).toBe(path);
        });

        it("should append to existing path in filter binnacle", async () => {
            // Arrange
            const existingPath = "/api";
            const filterPath = "/users/:id";
            const expectedPath = "/api/users/:id";  // Filter binnacle stores the pattern, not the matched value
            filterBinnacle.path = existingPath;
            httpPut.path = filterPath;
            httpPut.isLastFilter = true;
            mockRequest = createMockRequest("PUT", "/api/users/123");  // Actual request path
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPut.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
            expect(filterBinnacle.path).toBe(expectedPath);
        });
    });

    describe("isLastFilter behavior", () => {
        it("should allow partial match when isLastFilter is false", async () => {
            // Arrange
            const filterPath = "/api";
            const requestPath = "/api/users/123";
            httpPut.path = filterPath;
            httpPut.isLastFilter = false;
            mockRequest = createMockRequest("PUT", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPut.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should require exact match when isLastFilter is true", async () => {
            // Arrange
            const filterPath = "/api";
            const requestPath = "/api/users/123";
            httpPut.path = filterPath;
            httpPut.isLastFilter = true;
            mockRequest = createMockRequest("PUT", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPut.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("Method property", () => {
        it("should have method set to 'put'", () => {
            // Assert
            expect(httpPut.method).toBe("put");
        });
    });
});
