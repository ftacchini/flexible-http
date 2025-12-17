import "reflect-metadata";
import "jasmine";
import { FromHeaders } from "../../../src/built-ins/extractors/from-headers";
import { HttpEvent } from "../../../src/http-event";
import { FlexibleResponse } from "flexible-core";
import { Request, Response } from "express";
import { TypesHelper } from "../../../src/helpers/types-helper";

describe("FromHeaders Extractor", () => {
    let fromHeaders: FromHeaders;
    let mockTypesHelper: jasmine.SpyObj<TypesHelper>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockHttpEvent: HttpEvent;
    let mockFlexibleResponse: FlexibleResponse;

    /**
     * Helper function to create a mock request with headers
     */
    function createMockRequest(headers: { [key: string]: string | string[] }): Partial<Request> {
        return {
            headers: headers,
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

        // Create FromHeaders instance
        fromHeaders = new FromHeaders(mockTypesHelper);
    });

    describe("All headers extraction", () => {
        it("should extract all headers with allHeaders flag", async () => {
            // Arrange
            const headers = {
                "content-type": "application/json",
                "authorization": "Bearer token123",
                "x-api-key": "secret-key"
            };
            mockRequest = createMockRequest(headers);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromHeaders.allHeaders = true;

            // Act
            const result = await fromHeaders.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toEqual(headers);
        });

        it("should extract empty object when no headers present", async () => {
            // Arrange
            mockRequest = createMockRequest({});
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromHeaders.allHeaders = true;

            // Act
            const result = await fromHeaders.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toEqual({});
        });

        it("should handle headers with array values", async () => {
            // Arrange
            const headers = {
                "set-cookie": ["cookie1=value1", "cookie2=value2"],
                "accept": "application/json"
            };
            mockRequest = createMockRequest(headers);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromHeaders.allHeaders = true;

            // Act
            const result = await fromHeaders.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toEqual(headers);
        });
    });

    describe("Named header extraction", () => {
        it("should extract specific named header", async () => {
            // Arrange
            const headers = {
                "content-type": "application/json",
                "authorization": "Bearer token123",
                "x-api-key": "secret-key"
            };
            mockRequest = createMockRequest(headers);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromHeaders.name = "authorization";
            fromHeaders.allHeaders = false;

            // Act
            const result = await fromHeaders.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe("Bearer token123");
        });

        it("should extract custom header with x- prefix", async () => {
            // Arrange
            const headers = {
                "x-api-key": "secret-key",
                "x-request-id": "req-12345"
            };
            mockRequest = createMockRequest(headers);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromHeaders.name = "x-api-key";
            fromHeaders.allHeaders = false;

            // Act
            const result = await fromHeaders.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe("secret-key");
        });

        it("should extract standard HTTP headers", async () => {
            // Arrange
            const headers = {
                "content-type": "application/json",
                "accept": "application/json",
                "user-agent": "Mozilla/5.0"
            };
            mockRequest = createMockRequest(headers);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromHeaders.name = "content-type";
            fromHeaders.allHeaders = false;

            // Act
            const result = await fromHeaders.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe("application/json");
        });

        it("should handle header with array value", async () => {
            // Arrange
            const headers = {
                "set-cookie": ["cookie1=value1", "cookie2=value2"]
            };
            mockRequest = createMockRequest(headers);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromHeaders.name = "set-cookie";
            fromHeaders.allHeaders = false;

            // Act
            const result = await fromHeaders.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toEqual(["cookie1=value1", "cookie2=value2"]);
        });
    });

    describe("Missing headers", () => {
        it("should return undefined for non-existent header", async () => {
            // Arrange
            const headers = {
                "content-type": "application/json"
            };
            mockRequest = createMockRequest(headers);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromHeaders.name = "authorization";
            fromHeaders.allHeaders = false;

            // Act
            const result = await fromHeaders.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBeUndefined();
        });

        it("should return undefined when headers object is missing", async () => {
            // Arrange
            mockRequest = {
                method: "GET",
                path: "/test",
                url: "/test",
                ip: "127.0.0.1"
            } as Partial<Request>;
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromHeaders.name = "authorization";
            fromHeaders.allHeaders = false;

            // Act
            const result = await fromHeaders.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBeUndefined();
        });

        it("should return null when request data is missing", async () => {
            // Arrange
            const headers = {
                "content-type": "application/json"
            };
            mockRequest = createMockRequest(headers);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            // Simulate missing request by setting event data to null
            (mockHttpEvent as any).request = null;
            fromHeaders.name = "authorization";
            fromHeaders.allHeaders = false;

            // Act
            const result = await fromHeaders.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBeNull();
        });

        it("should return undefined when name is not set and allHeaders is false", async () => {
            // Arrange
            const headers = {
                "content-type": "application/json"
            };
            mockRequest = createMockRequest(headers);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromHeaders.allHeaders = false;
            // Don't set name

            // Act
            const result = await fromHeaders.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe("Case sensitivity", () => {
        it("should handle lowercase header names", async () => {
            // Arrange - Express normalizes headers to lowercase
            const headers = {
                "authorization": "Bearer token123",
                "content-type": "application/json"
            };
            mockRequest = createMockRequest(headers);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromHeaders.name = "authorization";
            fromHeaders.allHeaders = false;

            // Act
            const result = await fromHeaders.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe("Bearer token123");
        });

        it("should handle mixed-case header names in headers object", async () => {
            // Arrange - Some headers might have mixed case
            const headers = {
                "Content-Type": "application/json",
                "Authorization": "Bearer token123"
            };
            mockRequest = createMockRequest(headers);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromHeaders.name = "Content-Type";
            fromHeaders.allHeaders = false;

            // Act
            const result = await fromHeaders.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe("application/json");
        });
    });

    describe("Common HTTP headers", () => {
        it("should extract Authorization header", async () => {
            // Arrange
            const headers = {
                "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
            };
            mockRequest = createMockRequest(headers);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromHeaders.name = "authorization";
            fromHeaders.allHeaders = false;

            // Act
            const result = await fromHeaders.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
        });

        it("should extract User-Agent header", async () => {
            // Arrange
            const headers = {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            };
            mockRequest = createMockRequest(headers);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromHeaders.name = "user-agent";
            fromHeaders.allHeaders = false;

            // Act
            const result = await fromHeaders.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        });

        it("should extract Accept header", async () => {
            // Arrange
            const headers = {
                "accept": "application/json, text/plain, */*"
            };
            mockRequest = createMockRequest(headers);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromHeaders.name = "accept";
            fromHeaders.allHeaders = false;

            // Act
            const result = await fromHeaders.extractValueFromHttpEvent(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe("application/json, text/plain, */*");
        });
    });
});
