import "reflect-metadata";
import "jasmine";
import { HttpPatch } from "../../../src/filters/http-patch";
import { HttpEvent } from "../../../src/http-event";
import { RouteProcessor } from "../../../src/helpers/route-processor";
import { Request, Response } from "express";

describe("HttpPatch Filter Unit Tests", () => {
    let httpPatch: HttpPatch;
    let routeProcessor: RouteProcessor;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockHttpEvent: HttpEvent;
    let filterBinnacle: { [key: string]: string };

    beforeEach(() => {
        // Create real RouteProcessor instance
        routeProcessor = new RouteProcessor();

        // Create HttpPatch filter instance
        httpPatch = new HttpPatch(routeProcessor);

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

    describe("Matching PATCH requests", () => {
        it("should return true for PATCH request matching the path", async () => {
            // Arrange
            const path = "/users/123";
            httpPatch.path = path;
            httpPatch.isLastFilter = true;
            mockRequest = createMockRequest("PATCH", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPatch.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for PATCH request with path parameters", async () => {
            // Arrange
            const filterPath = "/users/:id";
            const requestPath = "/users/123";
            httpPatch.path = filterPath;
            httpPatch.isLastFilter = true;
            mockRequest = createMockRequest("PATCH", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPatch.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for PATCH request with multiple path parameters", async () => {
            // Arrange
            const filterPath = "/users/:userId/settings/:settingId";
            const requestPath = "/users/123/settings/456";
            httpPatch.path = filterPath;
            httpPatch.isLastFilter = true;
            mockRequest = createMockRequest("PATCH", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPatch.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for PATCH request to nested resource", async () => {
            // Arrange
            const path = "/organizations/456/users/123";
            httpPatch.path = path;
            httpPatch.isLastFilter = true;
            mockRequest = createMockRequest("PATCH", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPatch.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("Static routing configuration", () => {
        it("should have method set to 'patch' in staticRouting", () => {
            // Arrange
            httpPatch.path = "/users/123";

            // Act
            const staticRouting = httpPatch.staticRouting;

            // Assert
            expect(staticRouting.method).toBe("patch");
        });

        it("should include eventType in staticRouting", () => {
            // Arrange
            httpPatch.path = "/users/123";

            // Act
            const staticRouting = httpPatch.staticRouting;

            // Assert
            expect(staticRouting.eventType).toBeDefined();
        });

        it("should include route parts in staticRouting", () => {
            // Arrange
            httpPatch.path = "/users/profile";

            // Act
            const staticRouting = httpPatch.staticRouting;

            // Assert
            expect(staticRouting.routeParts).toBeDefined();
            expect(staticRouting.routeParts).toContain("users");
            expect(staticRouting.routeParts).toContain("profile");
        });
    });

    describe("Non-matching path", () => {
        it("should return false for different path", async () => {
            // Arrange
            const filterPath = "/users/123";
            const requestPath = "/posts/456";
            httpPatch.path = filterPath;
            httpPatch.isLastFilter = true;
            mockRequest = createMockRequest("PATCH", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPatch.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false for partial path match when isLastFilter is true", async () => {
            // Arrange
            const filterPath = "/users";
            const requestPath = "/users/123";
            httpPatch.path = filterPath;
            httpPatch.isLastFilter = true;
            mockRequest = createMockRequest("PATCH", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPatch.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false when path parameter doesn't match pattern", async () => {
            // Arrange
            const filterPath = "/users/:id/settings";
            const requestPath = "/users/123";
            httpPatch.path = filterPath;
            httpPatch.isLastFilter = true;
            mockRequest = createMockRequest("PATCH", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPatch.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("Filter binnacle path composition", () => {
        it("should compose path in filter binnacle", async () => {
            // Arrange
            const path = "/users/123";
            httpPatch.path = path;
            httpPatch.isLastFilter = true;
            mockRequest = createMockRequest("PATCH", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            await httpPatch.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(filterBinnacle.path).toBe(path);
        });

        it("should append to existing path in filter binnacle", async () => {
            // Arrange
            const existingPath = "/api/v1";
            const filterPath = "/users/:id";
            const expectedPath = "/api/v1/users/:id";
            const requestPath = "/api/v1/users/123";
            filterBinnacle.path = existingPath;
            httpPatch.path = filterPath;
            httpPatch.isLastFilter = true;
            mockRequest = createMockRequest("PATCH", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPatch.filterEvent(mockHttpEvent, filterBinnacle);

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
            httpPatch.path = filterPath;
            httpPatch.isLastFilter = false;
            mockRequest = createMockRequest("PATCH", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPatch.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should require exact match when isLastFilter is true", async () => {
            // Arrange
            const filterPath = "/api";
            const requestPath = "/api/users";
            httpPatch.path = filterPath;
            httpPatch.isLastFilter = true;
            mockRequest = createMockRequest("PATCH", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPatch.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("Method property", () => {
        it("should have method set to 'patch'", () => {
            // Assert
            expect(httpPatch.method).toBe("patch");
        });
    });
});
