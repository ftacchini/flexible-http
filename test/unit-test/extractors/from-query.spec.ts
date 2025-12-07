import "reflect-metadata";
import "jasmine";
import { FromQuery } from "../../../src/extractors/from-query";
import { HttpEvent } from "../../../src/http-event";
import { FlexibleResponse } from "flexible-core";
import { Request, Response } from "express";
import { TypesHelper } from "../../../src/helpers/types-helper";

describe("FromQuery Extractor", () => {
    let fromQuery: FromQuery;
    let mockTypesHelper: jasmine.SpyObj<TypesHelper>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockHttpEvent: HttpEvent;
    let mockFlexibleResponse: FlexibleResponse;

    /**
     * Helper function to create a mock request with query parameters
     */
    function createMockRequest(query: any): Partial<Request> {
        return {
            query: query,
            method: "GET",
            path: "/test",
            url: "/test"
        } as Partial<Request>;
    }

    beforeEach(() => {
        // Create mock TypesHelper
        mockTypesHelper = jasmine.createSpyObj<TypesHelper>("TypesHelper", ["castToType"]);
        mockTypesHelper.castToType.and.callFake((value: any) => value);

        mockResponse = {
            locals: {}
        } as Partial<Response>;

        // Create mock FlexibleResponse
        mockFlexibleResponse = {} as FlexibleResponse;

        // Create FromQuery instance
        fromQuery = new FromQuery(mockTypesHelper);
    });

    describe("All query parameters extraction", () => {
        it("should extract all query parameters with allQuery flag", async () => {
            // Arrange
            const queryParams = { q: "test", limit: "10", page: "1" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.allQuery = true;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(queryParams);
        });

        it("should extract single query parameter as object with allQuery flag", async () => {
            // Arrange
            const queryParams = { search: "typescript" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.allQuery = true;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(queryParams);
        });

        it("should extract multiple query parameters from complex query string", async () => {
            // Arrange
            const queryParams = {
                category: "books",
                sort: "price",
                order: "asc",
                minPrice: "10",
                maxPrice: "50"
            };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.allQuery = true;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(queryParams);
        });

        it("should return empty object when no query parameters present", async () => {
            // Arrange
            mockRequest = createMockRequest({});
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.allQuery = true;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual({});
        });

        it("should handle query parameters with special characters", async () => {
            // Arrange
            const queryParams = { email: "user@example.com", name: "John Doe" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.allQuery = true;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(queryParams);
        });

        it("should handle query parameters with numeric values", async () => {
            // Arrange
            const queryParams = { page: "1", limit: "20", offset: "0" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.allQuery = true;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(queryParams);
        });

        it("should handle query parameters with boolean-like values", async () => {
            // Arrange
            const queryParams = { active: "true", verified: "false" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.allQuery = true;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(queryParams);
        });

        it("should handle query parameters with array values", async () => {
            // Arrange
            const queryParams = { tags: ["javascript", "typescript", "node"] };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.allQuery = true;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(queryParams);
        });
    });

    describe("Named query parameter extraction", () => {
        it("should extract specific named query parameter", async () => {
            // Arrange
            const queryParams = { q: "test", limit: "10", page: "1" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "q";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("test");
        });

        it("should extract second named query parameter", async () => {
            // Arrange
            const queryParams = { q: "test", limit: "10", page: "1" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "limit";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("10");
        });

        it("should extract single query parameter by name", async () => {
            // Arrange
            const queryParams = { search: "typescript" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "search";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("typescript");
        });

        it("should return undefined for non-existent parameter name", async () => {
            // Arrange
            const queryParams = { q: "test" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "nonexistent";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeUndefined();
        });

        it("should extract parameter from complex query string", async () => {
            // Arrange
            const queryParams = {
                category: "books",
                sort: "price",
                order: "asc",
                minPrice: "10",
                maxPrice: "50"
            };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "sort";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("price");
        });

        it("should handle parameter with special characters", async () => {
            // Arrange
            const queryParams = { email: "user@example.com" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "email";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("user@example.com");
        });

        it("should extract numeric query parameter value", async () => {
            // Arrange
            const queryParams = { page: "42" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "page";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("42");
        });

        it("should extract array query parameter value", async () => {
            // Arrange
            const queryParams = { tags: ["javascript", "typescript"] };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "tags";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(["javascript", "typescript"]);
        });
    });

    describe("Missing query parameters", () => {
        it("should return undefined when query object is missing", async () => {
            // Arrange
            mockRequest = createMockRequest(undefined as any);
            // Remove the query property to simulate missing query
            delete (mockRequest as any).query;
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "q";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeUndefined();
        });

        it("should return undefined when allQuery is true and query object is missing", async () => {
            // Arrange
            mockRequest = createMockRequest(undefined as any);
            // Remove the query property to simulate missing query
            delete (mockRequest as any).query;
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.allQuery = true;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeUndefined();
        });

        it("should return empty object with allQuery when query is empty", async () => {
            // Arrange
            mockRequest = createMockRequest({});
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.allQuery = true;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual({});
        });

        it("should return undefined when named parameter is missing from query", async () => {
            // Arrange
            const queryParams = { other: "value" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "missing";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeUndefined();
        });

        it("should return undefined when neither allQuery nor name is set", async () => {
            // Arrange
            const queryParams = { q: "test" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.allQuery = false;
            // Don't set name

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe("Edge cases", () => {
        it("should handle empty string query parameter value", async () => {
            // Arrange
            const queryParams = { q: "" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "q";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("");
        });

        it("should handle query parameter with whitespace value", async () => {
            // Arrange
            const queryParams = { q: "  " };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "q";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("  ");
        });

        it("should handle query parameter with zero value", async () => {
            // Arrange
            const queryParams = { count: "0" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "count";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("0");
        });

        it("should handle query parameter with URL-encoded value", async () => {
            // Arrange
            const queryParams = { url: "https%3A%2F%2Fexample.com" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "url";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("https%3A%2F%2Fexample.com");
        });

        it("should handle query parameters with duplicate keys as array", async () => {
            // Arrange - Express parses duplicate keys as arrays
            const queryParams = { filter: ["active", "verified"] };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "filter";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(["active", "verified"]);
        });

        it("should handle query parameters with nested object structure", async () => {
            // Arrange - Express can parse nested query parameters
            const queryParams = { user: { name: "John", age: "30" } };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.allQuery = true;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(queryParams);
        });

        it("should handle query parameter with null value", async () => {
            // Arrange
            const queryParams = { param: null };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "param";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeNull();
        });

        it("should handle query parameter with undefined value", async () => {
            // Arrange
            const queryParams = { param: undefined };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "param";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe("Pagination and filtering use cases", () => {
        it("should extract pagination parameters", async () => {
            // Arrange
            const queryParams = { page: "2", limit: "20", offset: "20" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.allQuery = true;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(queryParams);
        });

        it("should extract search and filter parameters", async () => {
            // Arrange
            const queryParams = {
                q: "typescript",
                category: "programming",
                tags: ["web", "backend"],
                minPrice: "10",
                maxPrice: "100"
            };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.allQuery = true;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(queryParams);
        });

        it("should extract sorting parameters", async () => {
            // Arrange
            const queryParams = { sort: "createdAt", order: "desc" };
            mockRequest = createMockRequest(queryParams);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromQuery.name = "sort";
            fromQuery.allQuery = false;

            // Act
            const result = await fromQuery.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("createdAt");
        });
    });
});
