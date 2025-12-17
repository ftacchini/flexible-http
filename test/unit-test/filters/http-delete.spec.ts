import "reflect-metadata";
import "jasmine";
import { HttpDelete } from "../../../src/built-ins/filters/http-delete";
import { HttpEvent } from "../../../src/http-event";
import { RouteProcessor } from "../../../src/helpers/route-processor";
import { Request, Response } from "express";

describe("HttpDelete Filter Unit Tests", () => {
    let httpDelete: HttpDelete;
    let routeProcessor: RouteProcessor;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockHttpEvent: HttpEvent;
    let filterBinnacle: { [key: string]: string };

    beforeEach(() => {
        // Create real RouteProcessor instance
        routeProcessor = new RouteProcessor();

        // Create HttpDelete filter instance
        httpDelete = new HttpDelete(routeProcessor);

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

    describe("Matching DELETE requests", () => {
        it("should return true for DELETE request matching the path", async () => {
            // Arrange
            const path = "/users/123";
            httpDelete.path = path;
            httpDelete.isLastFilter = true;
            mockRequest = createMockRequest("DELETE", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpDelete.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for DELETE request with path parameters", async () => {
            // Arrange
            const filterPath = "/users/:id";
            const requestPath = "/users/123";
            httpDelete.path = filterPath;
            httpDelete.isLastFilter = true;
            mockRequest = createMockRequest("DELETE", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpDelete.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for DELETE request with multiple path parameters", async () => {
            // Arrange
            const filterPath = "/users/:userId/posts/:postId";
            const requestPath = "/users/123/posts/456";
            httpDelete.path = filterPath;
            httpDelete.isLastFilter = true;
            mockRequest = createMockRequest("DELETE", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpDelete.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true for DELETE request to collection endpoint", async () => {
            // Arrange
            const path = "/cache";
            httpDelete.path = path;
            httpDelete.isLastFilter = true;
            mockRequest = createMockRequest("DELETE", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpDelete.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("Static routing configuration", () => {
        it("should have method set to 'delete' in staticRouting", () => {
            // Arrange
            httpDelete.path = "/users/123";

            // Act
            const staticRouting = httpDelete.staticRouting;

            // Assert
            expect(staticRouting.method).toBe("delete");
        });

        it("should include eventType in staticRouting", () => {
            // Arrange
            httpDelete.path = "/users/123";

            // Act
            const staticRouting = httpDelete.staticRouting;

            // Assert
            expect(staticRouting.eventType).toBeDefined();
        });

        it("should include route parts in staticRouting", () => {
            // Arrange
            httpDelete.path = "/users/profile";

            // Act
            const staticRouting = httpDelete.staticRouting;

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
            httpDelete.path = filterPath;
            httpDelete.isLastFilter = true;
            mockRequest = createMockRequest("DELETE", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpDelete.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false for partial path match when isLastFilter is true", async () => {
            // Arrange
            const filterPath = "/users";
            const requestPath = "/users/123";
            httpDelete.path = filterPath;
            httpDelete.isLastFilter = true;
            mockRequest = createMockRequest("DELETE", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpDelete.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false when path parameter doesn't match pattern", async () => {
            // Arrange
            const filterPath = "/users/:id/posts";
            const requestPath = "/users/123";
            httpDelete.path = filterPath;
            httpDelete.isLastFilter = true;
            mockRequest = createMockRequest("DELETE", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpDelete.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("Filter binnacle path composition", () => {
        it("should compose path in filter binnacle", async () => {
            // Arrange
            const path = "/users/123";
            httpDelete.path = path;
            httpDelete.isLastFilter = true;
            mockRequest = createMockRequest("DELETE", path);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            await httpDelete.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(filterBinnacle.path).toBe(path);
        });

        it("should append to existing path in filter binnacle", async () => {
            // Arrange
            const existingPath = "/api";
            const filterPath = "/users/:id";
            const expectedPath = "/api/users/:id";
            const requestPath = "/api/users/123";
            filterBinnacle.path = existingPath;
            httpDelete.path = filterPath;
            httpDelete.isLastFilter = true;
            mockRequest = createMockRequest("DELETE", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpDelete.filterEvent(mockHttpEvent, filterBinnacle);

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
            httpDelete.path = filterPath;
            httpDelete.isLastFilter = false;
            mockRequest = createMockRequest("DELETE", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpDelete.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should require exact match when isLastFilter is true", async () => {
            // Arrange
            const filterPath = "/api";
            const requestPath = "/api/users";
            httpDelete.path = filterPath;
            httpDelete.isLastFilter = true;
            mockRequest = createMockRequest("DELETE", requestPath);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpDelete.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("Method property", () => {
        it("should have method set to 'delete'", () => {
            // Assert
            expect(httpDelete.method).toBe("delete");
        });
    });
});
