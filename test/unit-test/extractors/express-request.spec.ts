import "reflect-metadata";
import "jasmine";
import { ExpressRequest } from "../../../src/built-ins/extractors/express-request";
import { HttpEvent } from "../../../src/http-event";
import { FlexibleResponse } from "flexible-core";
import { Request, Response } from "express";

describe("ExpressRequest Extractor", () => {
    let expressRequest: ExpressRequest;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockHttpEvent: HttpEvent;
    let mockFlexibleResponse: FlexibleResponse;

    /**
     * Helper function to create a mock request with various properties
     */
    function createMockRequest(overrides?: Partial<Request>): Partial<Request> {
        return {
            method: "GET",
            path: "/test",
            url: "/test",
            protocol: "http",
            httpVersion: "1.1",
            ip: "127.0.0.1",
            hostname: "localhost",
            headers: {
                "content-type": "application/json",
                "user-agent": "test-agent"
            },
            body: { test: "data" },
            query: { param: "value" },
            params: { id: "123" },
            ...overrides
        } as Partial<Request>;
    }

    beforeEach(() => {
        mockResponse = {
            locals: {}
        } as Partial<Response>;

        // Create mock FlexibleResponse
        mockFlexibleResponse = {} as FlexibleResponse;

        // Create ExpressRequest instance
        expressRequest = new ExpressRequest();
    });

    describe("Complete request object extraction", () => {
        it("should return the complete request object", async () => {
            // Arrange
            mockRequest = createMockRequest();
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await expressRequest.extractValue(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe(mockRequest);
        });

        it("should return request with all standard properties", async () => {
            // Arrange
            mockRequest = createMockRequest({
                method: "POST",
                path: "/api/users",
                url: "/api/users?sort=name",
                protocol: "https",
                httpVersion: "1.1",
                ip: "192.168.1.1",
                hostname: "api.example.com"
            });
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await expressRequest.extractValue(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe(mockRequest);
            expect(result.method).toBe("POST");
            expect(result.path).toBe("/api/users");
            expect(result.url).toBe("/api/users?sort=name");
            expect(result.protocol).toBe("https");
            expect(result.ip).toBe("192.168.1.1");
            expect(result.hostname).toBe("api.example.com");
        });

        it("should return request with headers", async () => {
            // Arrange
            const headers = {
                "content-type": "application/json",
                "authorization": "Bearer token123",
                "x-api-key": "secret-key"
            };
            mockRequest = createMockRequest({ headers });
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await expressRequest.extractValue(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe(mockRequest);
            expect(result.headers).toEqual(headers);
        });

        it("should return request with body data", async () => {
            // Arrange
            const body = { username: "testuser", email: "test@example.com" };
            mockRequest = createMockRequest({ body });
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await expressRequest.extractValue(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe(mockRequest);
            expect(result.body).toEqual(body);
        });

        it("should return request with query parameters", async () => {
            // Arrange
            const query = { search: "test", page: "1", limit: "10" };
            mockRequest = createMockRequest({ query });
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await expressRequest.extractValue(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe(mockRequest);
            expect(result.query).toEqual(query);
        });

        it("should return request with path parameters", async () => {
            // Arrange
            const params = { userId: "123", postId: "456" };
            mockRequest = createMockRequest({ params });
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await expressRequest.extractValue(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe(mockRequest);
            expect(result.params).toEqual(params);
        });
    });

    describe("Custom properties", () => {
        it("should return request with custom properties added by middleware", async () => {
            // Arrange
            mockRequest = createMockRequest();
            (mockRequest as any).user = { id: 1, name: "Test User" };
            (mockRequest as any).session = { sessionId: "abc123" };
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await expressRequest.extractValue(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe(mockRequest);
            expect((result as any).user).toEqual({ id: 1, name: "Test User" });
            expect((result as any).session).toEqual({ sessionId: "abc123" });
        });

        it("should return request with cookies property", async () => {
            // Arrange
            mockRequest = createMockRequest();
            (mockRequest as any).cookies = { sessionId: "xyz789", theme: "dark" };
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await expressRequest.extractValue(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe(mockRequest);
            expect((result as any).cookies).toEqual({ sessionId: "xyz789", theme: "dark" });
        });
    });

    describe("Different HTTP methods", () => {
        it("should return request for GET method", async () => {
            // Arrange
            mockRequest = createMockRequest({ method: "GET" });
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await expressRequest.extractValue(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe(mockRequest);
            expect(result.method).toBe("GET");
        });

        it("should return request for POST method", async () => {
            // Arrange
            mockRequest = createMockRequest({ method: "POST" });
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await expressRequest.extractValue(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe(mockRequest);
            expect(result.method).toBe("POST");
        });

        it("should return request for PUT method", async () => {
            // Arrange
            mockRequest = createMockRequest({ method: "PUT" });
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await expressRequest.extractValue(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe(mockRequest);
            expect(result.method).toBe("PUT");
        });

        it("should return request for DELETE method", async () => {
            // Arrange
            mockRequest = createMockRequest({ method: "DELETE" });
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await expressRequest.extractValue(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe(mockRequest);
            expect(result.method).toBe("DELETE");
        });

        it("should return request for PATCH method", async () => {
            // Arrange
            mockRequest = createMockRequest({ method: "PATCH" });
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await expressRequest.extractValue(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe(mockRequest);
            expect(result.method).toBe("PATCH");
        });
    });

    describe("Static routing", () => {
        it("should have correct static routing configuration", () => {
            // Act
            const staticRouting = expressRequest.staticRouting;

            // Assert
            expect(staticRouting).toBeDefined();
            expect(staticRouting.eventType).toBe(HttpEvent.EventType);
        });
    });

    describe("Minimal request object", () => {
        it("should return request even with minimal properties", async () => {
            // Arrange - minimal request with only required properties
            mockRequest = {
                method: "GET",
                path: "/",
                url: "/",
                headers: {},
                protocol: "http",
                httpVersion: "1.1",
                ip: "127.0.0.1"
            } as Partial<Request>;
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await expressRequest.extractValue(mockHttpEvent, mockFlexibleResponse, {}, {});

            // Assert
            expect(result).toBe(mockRequest);
            expect(result.method).toBe("GET");
            expect(result.url).toBe("/");
        });
    });
});
