import "reflect-metadata";
import "jasmine";
import { FromLocals } from "../../../src/extractors/from-locals";
import { HttpEvent } from "../../../src/http-event";
import { FlexibleResponse } from "flexible-core";
import { Request, Response } from "express";
import { TypesHelper } from "../../../src/helpers/types-helper";

describe("FromLocals Extractor", () => {
    let fromLocals: FromLocals;
    let mockTypesHelper: jasmine.SpyObj<TypesHelper>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockHttpEvent: HttpEvent;
    let mockFlexibleResponse: FlexibleResponse;

    /**
     * Helper function to create a mock response with locals
     */
    function createMockResponse(locals: any): Partial<Response> {
        return {
            locals: locals
        } as Partial<Response>;
    }

    beforeEach(() => {
        // Create mock TypesHelper
        mockTypesHelper = jasmine.createSpyObj<TypesHelper>("TypesHelper", ["castToType"]);
        mockTypesHelper.castToType.and.callFake((value: any) => value);

        mockRequest = {
            method: "GET",
            path: "/test",
            url: "/test"
        } as Partial<Request>;

        // Create mock FlexibleResponse
        mockFlexibleResponse = {} as FlexibleResponse;

        // Create FromLocals instance
        fromLocals = new FromLocals(mockTypesHelper);
    });

    describe("All locals extraction", () => {
        it("should extract all locals with allLocals flag", async () => {
            // Arrange
            const localsData = { user: { id: 1, name: "John" }, session: "abc123" };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.allLocals = true;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(localsData);
        });

        it("should extract single local as object with allLocals flag", async () => {
            // Arrange
            const localsData = { userId: 42 };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.allLocals = true;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(localsData);
        });

        it("should extract multiple locals from middleware chain", async () => {
            // Arrange
            const localsData = {
                user: { id: 1, name: "John", email: "john@example.com" },
                session: { id: "abc123", expires: "2024-12-31" },
                requestId: "req-12345",
                authenticated: true
            };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.allLocals = true;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(localsData);
        });

        it("should return empty object when no locals present", async () => {
            // Arrange
            mockResponse = createMockResponse({});
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.allLocals = true;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual({});
        });

        it("should handle locals with nested objects", async () => {
            // Arrange
            const localsData = {
                user: {
                    profile: {
                        name: "John Doe",
                        address: {
                            city: "New York",
                            country: "USA"
                        }
                    }
                }
            };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.allLocals = true;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(localsData);
        });

        it("should handle locals with array values", async () => {
            // Arrange
            const localsData = {
                roles: ["admin", "user", "moderator"],
                permissions: ["read", "write", "delete"]
            };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.allLocals = true;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(localsData);
        });

        it("should handle locals with various data types", async () => {
            // Arrange
            const localsData = {
                stringValue: "test",
                numberValue: 42,
                booleanValue: true,
                nullValue: null,
                arrayValue: [1, 2, 3],
                objectValue: { key: "value" }
            };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.allLocals = true;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(localsData);
        });
    });

    describe("Named local extraction", () => {
        it("should extract specific named local", async () => {
            // Arrange
            const localsData = { user: { id: 1, name: "John" }, session: "abc123" };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "user";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual({ id: 1, name: "John" });
        });

        it("should extract second named local", async () => {
            // Arrange
            const localsData = { user: { id: 1, name: "John" }, session: "abc123" };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "session";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("abc123");
        });

        it("should extract single local by name", async () => {
            // Arrange
            const localsData = { userId: 42 };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "userId";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe(42);
        });

        it("should return undefined for non-existent local name", async () => {
            // Arrange
            const localsData = { user: { id: 1 } };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "nonexistent";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeUndefined();
        });

        it("should extract local from complex locals object", async () => {
            // Arrange
            const localsData = {
                user: { id: 1, name: "John" },
                session: { id: "abc123" },
                requestId: "req-12345",
                authenticated: true,
                roles: ["admin", "user"]
            };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "requestId";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("req-12345");
        });

        it("should extract boolean local value", async () => {
            // Arrange
            const localsData = { authenticated: true };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "authenticated";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe(true);
        });

        it("should extract numeric local value", async () => {
            // Arrange
            const localsData = { count: 42 };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "count";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe(42);
        });

        it("should extract array local value", async () => {
            // Arrange
            const localsData = { roles: ["admin", "user"] };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "roles";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(["admin", "user"]);
        });

        it("should extract nested object local value", async () => {
            // Arrange
            const localsData = {
                user: {
                    profile: {
                        name: "John Doe"
                    }
                }
            };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "user";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual({ profile: { name: "John Doe" } });
        });
    });

    describe("Missing locals", () => {
        it("should return undefined when locals object is missing", async () => {
            // Arrange
            mockResponse = {} as Partial<Response>;
            // Don't set locals property
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "user";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeUndefined();
        });

        it("should return undefined when allLocals is true and locals object is missing", async () => {
            // Arrange
            mockResponse = {} as Partial<Response>;
            // Don't set locals property
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.allLocals = true;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeUndefined();
        });

        it("should return empty object with allLocals when locals is empty", async () => {
            // Arrange
            mockResponse = createMockResponse({});
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.allLocals = true;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual({});
        });

        it("should return undefined when named local is missing from locals", async () => {
            // Arrange
            const localsData = { other: "value" };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "missing";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeUndefined();
        });

        it("should return undefined when neither allLocals nor name is set", async () => {
            // Arrange
            const localsData = { user: { id: 1 } };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.allLocals = false;
            // Don't set name

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeUndefined();
        });

        it("should return undefined when response object is missing", async () => {
            // Arrange
            mockHttpEvent = new HttpEvent(mockRequest as Request, undefined as any);
            fromLocals.name = "user";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe("Edge cases", () => {
        it("should handle empty string local value", async () => {
            // Arrange
            const localsData = { message: "" };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "message";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("");
        });

        it("should handle local with whitespace value", async () => {
            // Arrange
            const localsData = { message: "  " };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "message";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("  ");
        });

        it("should handle local with zero value", async () => {
            // Arrange
            const localsData = { count: 0 };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "count";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe(0);
        });

        it("should handle local with false value", async () => {
            // Arrange
            const localsData = { enabled: false };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "enabled";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe(false);
        });

        it("should handle local with null value", async () => {
            // Arrange
            const localsData = { value: null };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "value";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeNull();
        });

        it("should handle local with undefined value", async () => {
            // Arrange
            const localsData = { value: undefined };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "value";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeUndefined();
        });

        it("should handle empty array local value", async () => {
            // Arrange
            const localsData = { items: [] };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "items";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual([]);
        });

        it("should handle empty object local value", async () => {
            // Arrange
            const localsData = { data: {} };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "data";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual({});
        });
    });

    describe("Authentication and session use cases", () => {
        it("should extract user data set by authentication middleware", async () => {
            // Arrange
            const localsData = {
                user: {
                    id: 123,
                    username: "johndoe",
                    email: "john@example.com",
                    roles: ["user", "admin"]
                }
            };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "user";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(localsData.user);
        });

        it("should extract session data", async () => {
            // Arrange
            const localsData = {
                session: {
                    id: "sess-abc123",
                    userId: 123,
                    expires: "2024-12-31T23:59:59Z"
                }
            };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "session";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(localsData.session);
        });

        it("should extract request ID for logging", async () => {
            // Arrange
            const localsData = { requestId: "req-12345-abcde" };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.name = "requestId";
            fromLocals.allLocals = false;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("req-12345-abcde");
        });

        it("should extract all middleware data at once", async () => {
            // Arrange
            const localsData = {
                user: { id: 123, username: "johndoe" },
                session: { id: "sess-abc123" },
                requestId: "req-12345",
                authenticated: true,
                csrfToken: "token-xyz"
            };
            mockResponse = createMockResponse(localsData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromLocals.allLocals = true;

            // Act
            const result = await fromLocals.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(localsData);
        });
    });
});
