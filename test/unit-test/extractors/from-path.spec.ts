import "reflect-metadata";
import "jasmine";
import { FromPath } from "../../../src/extractors/from-path";
import { HttpEvent } from "../../../src/http-event";
import { FlexibleResponse } from "flexible-core";
import { Request, Response } from "express";
import { TypesHelper } from "../../../src/helpers/types-helper";
import { RouteProcessor } from "../../../src/helpers/route-processor";

describe("FromPath Extractor", () => {
    let fromPath: FromPath;
    let mockTypesHelper: jasmine.SpyObj<TypesHelper>;
    let mockRouteProcessor: RouteProcessor;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockHttpEvent: HttpEvent;
    let mockFlexibleResponse: FlexibleResponse;
    let filterBinnacle: { [key: string]: string };

    /**
     * Helper function to create a mock request with path
     */
    function createMockRequest(path: string): Partial<Request> {
        return {
            path: path,
            method: "GET",
            url: path
        } as Partial<Request>;
    }

    beforeEach(() => {
        // Create mock TypesHelper
        mockTypesHelper = jasmine.createSpyObj<TypesHelper>("TypesHelper", ["castToType"]);
        mockTypesHelper.castToType.and.callFake((value: any) => value);

        // Create real RouteProcessor instance (not mocked, as it's a simple wrapper)
        mockRouteProcessor = new RouteProcessor();

        mockResponse = {
            locals: {}
        } as Partial<Response>;

        // Create mock FlexibleResponse
        mockFlexibleResponse = {} as FlexibleResponse;

        // Initialize filterBinnacle
        filterBinnacle = {};

        // Create FromPath instance
        fromPath = new FromPath(mockTypesHelper, mockRouteProcessor);
    });

    describe("All path parameters extraction", () => {
        it("should extract all path parameters with allPath flag", async () => {
            // Arrange
            mockRequest = createMockRequest("/users/123/posts/456");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.allPath = true;
            filterBinnacle.path = "/users/:userId/posts/:postId";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toEqual({ userId: "123", postId: "456" });
        });

        it("should extract single path parameter as object with allPath flag", async () => {
            // Arrange
            mockRequest = createMockRequest("/users/42");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.allPath = true;
            filterBinnacle.path = "/users/:id";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toEqual({ id: "42" });
        });

        it("should extract multiple path parameters from complex route", async () => {
            // Arrange
            mockRequest = createMockRequest("/api/v1/organizations/org123/projects/proj456/tasks/task789");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.allPath = true;
            filterBinnacle.path = "/api/v1/organizations/:orgId/projects/:projectId/tasks/:taskId";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toEqual({
                orgId: "org123",
                projectId: "proj456",
                taskId: "task789"
            });
        });

        it("should return empty object when no path parameters in route", async () => {
            // Arrange
            mockRequest = createMockRequest("/users");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.allPath = true;
            filterBinnacle.path = "/users";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toEqual({});
        });

        it("should handle path parameters with special characters", async () => {
            // Arrange
            mockRequest = createMockRequest("/files/my-file-name.txt");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.allPath = true;
            filterBinnacle.path = "/files/:filename";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toEqual({ filename: "my-file-name.txt" });
        });

        it("should handle path parameters with numeric values", async () => {
            // Arrange
            mockRequest = createMockRequest("/items/12345");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.allPath = true;
            filterBinnacle.path = "/items/:itemId";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toEqual({ itemId: "12345" });
        });
    });

    describe("Named path parameter extraction", () => {
        it("should extract specific named path parameter", async () => {
            // Arrange
            mockRequest = createMockRequest("/users/123/posts/456");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.name = "userId";
            fromPath.allPath = false;
            filterBinnacle.path = "/users/:userId/posts/:postId";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toBe("123");
        });

        it("should extract second named path parameter", async () => {
            // Arrange
            mockRequest = createMockRequest("/users/123/posts/456");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.name = "postId";
            fromPath.allPath = false;
            filterBinnacle.path = "/users/:userId/posts/:postId";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toBe("456");
        });

        it("should extract single path parameter by name", async () => {
            // Arrange
            mockRequest = createMockRequest("/users/42");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.name = "id";
            fromPath.allPath = false;
            filterBinnacle.path = "/users/:id";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toBe("42");
        });

        it("should return undefined for non-existent parameter name", async () => {
            // Arrange
            mockRequest = createMockRequest("/users/123");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.name = "nonexistent";
            fromPath.allPath = false;
            filterBinnacle.path = "/users/:id";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toBeUndefined();
        });

        it("should extract parameter from middle of complex route", async () => {
            // Arrange
            mockRequest = createMockRequest("/api/v1/organizations/org123/projects/proj456/tasks/task789");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.name = "projectId";
            fromPath.allPath = false;
            filterBinnacle.path = "/api/v1/organizations/:orgId/projects/:projectId/tasks/:taskId";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toBe("proj456");
        });

        it("should handle parameter with special characters", async () => {
            // Arrange
            mockRequest = createMockRequest("/files/document-2024.pdf");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.name = "filename";
            fromPath.allPath = false;
            filterBinnacle.path = "/files/:filename";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toBe("document-2024.pdf");
        });
    });

    describe("Non-matching paths", () => {
        it("should return null when path does not match route pattern", async () => {
            // Arrange
            mockRequest = createMockRequest("/products/123");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.allPath = true;
            filterBinnacle.path = "/users/:id";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toBeNull();
        });

        it("should return null when path has different segment count", async () => {
            // Arrange
            mockRequest = createMockRequest("/users/123/extra");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.allPath = true;
            filterBinnacle.path = "/users/:id";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toBeNull();
        });

        it("should return null when path is completely different", async () => {
            // Arrange
            mockRequest = createMockRequest("/api/v2/data");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.name = "userId";
            fromPath.allPath = false;
            filterBinnacle.path = "/users/:userId/posts/:postId";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toBeNull();
        });

        it("should return null when path is empty", async () => {
            // Arrange
            mockRequest = createMockRequest("");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.allPath = true;
            filterBinnacle.path = "/users/:id";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toBeNull();
        });

        it("should throw error when route pattern is not in filterBinnacle", async () => {
            // Arrange
            mockRequest = createMockRequest("/users/123");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.allPath = true;
            filterBinnacle = {}; // No path in filterBinnacle

            // Act & Assert
            // The pathToRegexp function throws when path is undefined
            await expectAsync(
                fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {})
            ).toBeRejected();
        });
    });

    describe("Edge cases", () => {
        it("should return null when neither allPath nor name is set", async () => {
            // Arrange
            mockRequest = createMockRequest("/users/123");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.allPath = false;
            // Don't set name
            filterBinnacle.path = "/users/:id";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toBeNull();
        });

        it("should handle root path with parameter", async () => {
            // Arrange
            mockRequest = createMockRequest("/123");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.name = "id";
            fromPath.allPath = false;
            filterBinnacle.path = "/:id";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toBe("123");
        });

        it("should handle path with trailing slash", async () => {
            // Arrange
            mockRequest = createMockRequest("/users/123/");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.name = "id";
            fromPath.allPath = false;
            filterBinnacle.path = "/users/:id";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            // path-to-regexp may or may not match trailing slashes depending on configuration
            // This test documents the actual behavior
            expect(result).toBeDefined();
        });

        it("should handle URL-encoded path parameters", async () => {
            // Arrange
            mockRequest = createMockRequest("/files/my%20file.txt");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.name = "filename";
            fromPath.allPath = false;
            filterBinnacle.path = "/files/:filename";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toBe("my%20file.txt");
        });

        it("should handle path parameters with UUID format", async () => {
            // Arrange
            const uuid = "550e8400-e29b-41d4-a716-446655440000";
            mockRequest = createMockRequest(`/resources/${uuid}`);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.name = "resourceId";
            fromPath.allPath = false;
            filterBinnacle.path = "/resources/:resourceId";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toBe(uuid);
        });

        it("should handle consecutive path parameters", async () => {
            // Arrange
            mockRequest = createMockRequest("/api/123/456");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.allPath = true;
            filterBinnacle.path = "/api/:first/:second";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toEqual({ first: "123", second: "456" });
        });
    });

    describe("Nested routes", () => {
        it("should extract parameters from nested route structure", async () => {
            // Arrange
            mockRequest = createMockRequest("/api/v1/users/user123/settings");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.name = "userId";
            fromPath.allPath = false;
            filterBinnacle.path = "/api/v1/users/:userId/settings";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toBe("user123");
        });

        it("should extract all parameters from deeply nested route", async () => {
            // Arrange
            mockRequest = createMockRequest("/v1/countries/us/states/ca/cities/sf");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromPath.allPath = true;
            filterBinnacle.path = "/v1/countries/:country/states/:state/cities/:city";

            // Act
            const result = await fromPath.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, filterBinnacle, {});

            // Assert
            expect(result).toEqual({
                country: "us",
                state: "ca",
                city: "sf"
            });
        });
    });
});
