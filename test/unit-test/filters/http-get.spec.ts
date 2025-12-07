import "reflect-metadata";
import "jasmine";
import { HttpGet } from "../../../src/filters/http-get";
import { HttpEvent } from "../../../src/http-event";
import { RouteProcessor } from "../../../src/helpers/route-processor";
import { Request, Response } from "express";

describe("HttpGet Filter Unit Tests", () => {
    let httpGet: HttpGet;
    let routeProcessor: RouteProcessor;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockHttpEvent: HttpEvent;
    let filterBinnacle: { [key: string]: string };

    beforeEach(() => {
        // Create real RouteProcessor instance
        routeProcessor = new RouteProcessor();

        // Create HttpGet filter instance
        httpGet = new HttpGet(routeProcessor);

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

    describe("Matching GET requests", () => {
        it("should return true for GET request matching the path", async () => {
            // Arrange
            const path = "/users";
            httpGet.path = path;
            httpGet.isLastFilter = true;
            mockRequest = createMockRequest("GET", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpGet.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for GET request with path parameters", async () => {
            // Arrange
            const filterPath = "/users/:id";
            const requestPath = "/users/123";
            httpGet.path = filterPath;
            httpGet.isLastFilter = true;
            mockRequest = createMockRequest("GET", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpGet.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for GET request with multiple path parameters", async () => {
            // Arrange
            const filterPath = "/users/:userId/posts/:postId";
            const requestPath = "/users/123/posts/456";
            httpGet.path = filterPath;
            httpGet.isLastFilter = true;
            mockRequest = createMockRequest("GET", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpGet.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for GET request with query parameters", async () => {
            // Arrange
            const path = "/search";
            httpGet.path = path;
            httpGet.isLastFilter = true;
            mockRequest = createMockRequest("GET", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpGet.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("Static routing configuration", () => {
        it("should have method set to 'get' in staticRouting", () => {
            // Arrange
            httpGet.path = "/users";

            // Act
            const staticRouting = httpGet.staticRouting;

            // Assert
            expect(staticRouting.method).toBe("get");
        });

        it("should include eventType in staticRouting", () => {
            // Arrange
            httpGet.path = "/users";

            // Act
            const staticRouting = httpGet.staticRouting;

            // Assert
            expect(staticRouting.eventType).toBeDefined();
        });

        it("should include route parts in staticRouting", () => {
            // Arrange
            httpGet.path = "/users/profile";

            // Act
            const staticRouting = httpGet.staticRouting;

            // Assert
            expect(staticRouting.routeParts).toBeDefined();
            expect(staticRouting.routeParts).toContain("users");
            expect(staticRouting.routeParts).toContain("profile");
        });
    });

    describe("Non-matching path", () => {
        it("should return false for different path", async () => {
            // Arrange
            const filterPath = "/users";
            const requestPath = "/posts";
            httpGet.path = filterPath;
            httpGet.isLastFilter = true;
            mockRequest = createMockRequest("GET", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpGet.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false for partial path match when isLastFilter is true", async () => {
            // Arrange
            const filterPath = "/users";
            const requestPath = "/users/123";
            httpGet.path = filterPath;
            httpGet.isLastFilter = true;
            mockRequest = createMockRequest("GET", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpGet.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false when path parameter doesn't match pattern", async () => {
            // Arrange
            const filterPath = "/users/:id/posts";
            const requestPath = "/users/123";
            httpGet.path = filterPath;
            httpGet.isLastFilter = true;
            mockRequest = createMockRequest("GET", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpGet.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("Filter binnacle path composition", () => {
        it("should compose path in filter binnacle", async () => {
            // Arrange
            const path = "/users";
            httpGet.path = path;
            httpGet.isLastFilter = true;
            mockRequest = createMockRequest("GET", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            await httpGet.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(filterBinnacle.path).toBe(path);
        });

        it("should append to existing path in filter binnacle", async () => {
            // Arrange
            const existingPath = "/api";
            const filterPath = "/users";
            const expectedPath = "/api/users";
            filterBinnacle.path = existingPath;
            httpGet.path = filterPath;
            httpGet.isLastFilter = true;
            mockRequest = createMockRequest("GET", expectedPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpGet.filterEvent(mockHttpEvent, filterBinnacle);

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
            httpGet.path = filterPath;
            httpGet.isLastFilter = false;
            mockRequest = createMockRequest("GET", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpGet.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should require exact match when isLastFilter is true", async () => {
            // Arrange
            const filterPath = "/api";
            const requestPath = "/api/users";
            httpGet.path = filterPath;
            httpGet.isLastFilter = true;
            mockRequest = createMockRequest("GET", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpGet.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("Method property", () => {
        it("should have method set to 'get'", () => {
            // Assert
            expect(httpGet.method).toBe("get");
        });
    });
});
