import "reflect-metadata";
import "jasmine";
import { HttpPost } from "../../../src/built-ins/filters/http-post";
import { HttpEvent } from "../../../src/http-event";
import { RouteProcessor } from "../../../src/helpers/route-processor";
import { Request, Response } from "express";

describe("HttpPost Filter Unit Tests", () => {
    let httpPost: HttpPost;
    let routeProcessor: RouteProcessor;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockHttpEvent: HttpEvent;
    let filterBinnacle: { [key: string]: string };

    beforeEach(() => {
        // Create real RouteProcessor instance
        routeProcessor = new RouteProcessor();

        // Create HttpPost filter instance
        httpPost = new HttpPost(routeProcessor);

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

    describe("Matching POST requests", () => {
        it("should return true for POST request matching the path", async () => {
            // Arrange
            const path = "/users";
            httpPost.path = path;
            httpPost.isLastFilter = true;
            mockRequest = createMockRequest("POST", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPost.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for POST request with path parameters", async () => {
            // Arrange
            const filterPath = "/users/:id/activate";
            const requestPath = "/users/123/activate";
            httpPost.path = filterPath;
            httpPost.isLastFilter = true;
            mockRequest = createMockRequest("POST", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPost.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for POST request with multiple path parameters", async () => {
            // Arrange
            const filterPath = "/organizations/:orgId/users/:userId";
            const requestPath = "/organizations/456/users/123";
            httpPost.path = filterPath;
            httpPost.isLastFilter = true;
            mockRequest = createMockRequest("POST", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPost.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for POST request to root path", async () => {
            // Arrange
            const path = "/";
            httpPost.path = path;
            httpPost.isLastFilter = true;
            mockRequest = createMockRequest("POST", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPost.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("Static routing configuration", () => {
        it("should have method set to 'post' in staticRouting", () => {
            // Arrange
            httpPost.path = "/users";

            // Act
            const staticRouting = httpPost.staticRouting;

            // Assert
            expect(staticRouting.method).toBe("post");
        });

        it("should include eventType in staticRouting", () => {
            // Arrange
            httpPost.path = "/users";

            // Act
            const staticRouting = httpPost.staticRouting;

            // Assert
            expect(staticRouting.eventType).toBeDefined();
        });

        it("should include route parts in staticRouting", () => {
            // Arrange
            httpPost.path = "/users/create";

            // Act
            const staticRouting = httpPost.staticRouting;

            // Assert
            expect(staticRouting.routeParts).toBeDefined();
            expect(staticRouting.routeParts).toContain("users");
            expect(staticRouting.routeParts).toContain("create");
        });
    });

    describe("Non-matching path", () => {
        it("should return false for different path", async () => {
            // Arrange
            const filterPath = "/users";
            const requestPath = "/posts";
            httpPost.path = filterPath;
            httpPost.isLastFilter = true;
            mockRequest = createMockRequest("POST", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPost.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false for partial path match when isLastFilter is true", async () => {
            // Arrange
            const filterPath = "/users";
            const requestPath = "/users/123";
            httpPost.path = filterPath;
            httpPost.isLastFilter = true;
            mockRequest = createMockRequest("POST", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPost.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false when path parameter doesn't match pattern", async () => {
            // Arrange
            const filterPath = "/users/:id/posts";
            const requestPath = "/users/123";
            httpPost.path = filterPath;
            httpPost.isLastFilter = true;
            mockRequest = createMockRequest("POST", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPost.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("Filter binnacle path composition", () => {
        it("should compose path in filter binnacle", async () => {
            // Arrange
            const path = "/users";
            httpPost.path = path;
            httpPost.isLastFilter = true;
            mockRequest = createMockRequest("POST", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            await httpPost.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(filterBinnacle.path).toBe(path);
        });

        it("should append to existing path in filter binnacle", async () => {
            // Arrange
            const existingPath = "/api";
            const filterPath = "/users";
            const expectedPath = "/api/users";
            filterBinnacle.path = existingPath;
            httpPost.path = filterPath;
            httpPost.isLastFilter = true;
            mockRequest = createMockRequest("POST", expectedPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPost.filterEvent(mockHttpEvent, filterBinnacle);

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
            httpPost.path = filterPath;
            httpPost.isLastFilter = false;
            mockRequest = createMockRequest("POST", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPost.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should require exact match when isLastFilter is true", async () => {
            // Arrange
            const filterPath = "/api";
            const requestPath = "/api/users";
            httpPost.path = filterPath;
            httpPost.isLastFilter = true;
            mockRequest = createMockRequest("POST", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpPost.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("Method property", () => {
        it("should have method set to 'post'", () => {
            // Assert
            expect(httpPost.method).toBe("post");
        });
    });
});
