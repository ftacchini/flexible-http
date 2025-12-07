import "reflect-metadata";
import "jasmine";
import { FromBody } from "../../../src/extractors/from-body";
import { HttpBodyType } from "../../../src/extractors/http-body-type";
import { HttpEvent } from "../../../src/http-event";
import { FlexibleResponse } from "flexible-core";
import { Request, Response } from "express";
import { TypesHelper } from "../../../src/helpers/types-helper";
import { Readable } from "stream";

describe("FromBody Extractor", () => {
    let fromBody: FromBody;
    let mockTypesHelper: jasmine.SpyObj<TypesHelper>;
    let mockRequest: any;
    let mockResponse: Partial<Response>;
    let mockHttpEvent: HttpEvent;
    let mockFlexibleResponse: FlexibleResponse;

    /**
     * Helper function to create a mock readable stream with data
     */
    function createMockStream(data: string): Readable {
        const stream = new Readable();
        stream.push(data);
        stream.push(null); // Signal end of stream
        return stream;
    }

    /**
     * Helper function to create a mock request with stream data
     */
    function createMockRequest(bodyData: any, contentType: string = "application/json"): any {
        const jsonString = typeof bodyData === "string" ? bodyData : JSON.stringify(bodyData);
        const mockStream = createMockStream(jsonString);

        return Object.assign(mockStream, {
            body: undefined,
            method: "POST",
            path: "/test",
            url: "/test",
            protocol: "http",
            httpVersion: "1.1",
            ip: "127.0.0.1",
            headers: {
                "content-type": contentType,
                "content-length": jsonString.length.toString()
            },
            get: function(name: string) {
                return this.headers[name.toLowerCase()];
            }
        });
    }

    beforeEach(() => {
        // Create mock TypesHelper
        mockTypesHelper = jasmine.createSpyObj<TypesHelper>("TypesHelper", ["castToType"]);
        mockTypesHelper.castToType.and.callFake((value: any) => value);

        mockResponse = {
            locals: {}
        } as any;

        // Create mock FlexibleResponse
        mockFlexibleResponse = {} as FlexibleResponse;

        // Create FromBody instance
        fromBody = new FromBody(mockTypesHelper);
    });

    describe("JSON body extraction", () => {
        it("should extract complete JSON body with allBody flag", async () => {
            // Arrange
            const bodyData = { username: "testuser", email: "test@example.com" };
            mockRequest = createMockRequest(bodyData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromBody.allBody = true;
            fromBody.bodyType = HttpBodyType.Json;

            // Act
            const result = await fromBody.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(bodyData);
        });

        it("should extract named field from JSON body", async () => {
            // Arrange
            const bodyData = { username: "testuser", email: "test@example.com" };
            mockRequest = createMockRequest(bodyData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromBody.name = "username";
            fromBody.allBody = false;
            fromBody.bodyType = HttpBodyType.Json;

            // Act
            const result = await fromBody.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("testuser");
        });

        it("should return undefined for non-existent field", async () => {
            // Arrange
            const bodyData = { username: "testuser" };
            mockRequest = createMockRequest(bodyData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromBody.name = "nonexistent";
            fromBody.allBody = false;
            fromBody.bodyType = HttpBodyType.Json;

            // Act
            const result = await fromBody.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeUndefined();
        });

        it("should handle nested JSON objects", async () => {
            // Arrange
            const bodyData = {
                user: {
                    profile: {
                        name: "Test User"
                    }
                }
            };
            mockRequest = createMockRequest(bodyData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromBody.allBody = true;
            fromBody.bodyType = HttpBodyType.Json;

            // Act
            const result = await fromBody.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(bodyData);
        });
    });

    describe("URL-encoded body extraction", () => {
        it("should extract complete URL-encoded body with allBody flag", async () => {
            // Arrange
            const bodyString = "field1=value1&field2=value2";
            const mockStream = createMockStream(bodyString);
            mockRequest = Object.assign(mockStream, {
                body: undefined,
                method: "POST",
                path: "/test",
                url: "/test",
                protocol: "http",
                httpVersion: "1.1",
                ip: "127.0.0.1",
                headers: {
                    "content-type": "application/x-www-form-urlencoded",
                    "content-length": bodyString.length.toString()
                },
                get: function(name: string) {
                    return this.headers[name.toLowerCase()];
                }
            });
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromBody.allBody = true;
            fromBody.bodyType = HttpBodyType.Urlencoded;
            fromBody.bodyOptions = { extended: false };

            // Act
            const result = await fromBody.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual({ field1: "value1", field2: "value2" });
        });

        it("should extract named field from URL-encoded body", async () => {
            // Arrange
            const bodyString = "field1=value1&field2=value2";
            const mockStream = createMockStream(bodyString);
            mockRequest = Object.assign(mockStream, {
                body: undefined,
                method: "POST",
                path: "/test",
                url: "/test",
                protocol: "http",
                httpVersion: "1.1",
                ip: "127.0.0.1",
                headers: {
                    "content-type": "application/x-www-form-urlencoded",
                    "content-length": bodyString.length.toString()
                },
                get: function(name: string) {
                    return this.headers[name.toLowerCase()];
                }
            });
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromBody.name = "field1";
            fromBody.allBody = false;
            fromBody.bodyType = HttpBodyType.Urlencoded;
            fromBody.bodyOptions = { extended: false };

            // Act
            const result = await fromBody.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe("value1");
        });
    });

    describe("Text body extraction", () => {
        it("should extract text body with allBody flag", async () => {
            // Arrange
            const bodyData = "plain text content";
            const mockStream = createMockStream(bodyData);
            mockRequest = Object.assign(mockStream, {
                body: undefined,
                method: "POST",
                path: "/test",
                url: "/test",
                protocol: "http",
                httpVersion: "1.1",
                ip: "127.0.0.1",
                headers: {
                    "content-type": "text/plain",
                    "content-length": bodyData.length.toString()
                },
                get: function(name: string) {
                    return this.headers[name.toLowerCase()];
                }
            });
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromBody.allBody = true;
            fromBody.bodyType = HttpBodyType.Text;

            // Act
            const result = await fromBody.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBe(bodyData);
        });
    });

    describe("Raw body extraction", () => {
        it("should extract raw body with allBody flag", async () => {
            // Arrange
            const bodyData = "raw binary data";
            const mockStream = createMockStream(bodyData);
            mockRequest = Object.assign(mockStream, {
                body: undefined,
                method: "POST",
                path: "/test",
                url: "/test",
                protocol: "http",
                httpVersion: "1.1",
                ip: "127.0.0.1",
                headers: {
                    "content-type": "application/octet-stream",
                    "content-length": bodyData.length.toString()
                },
                get: function(name: string) {
                    return this.headers[name.toLowerCase()];
                }
            });
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromBody.allBody = true;
            fromBody.bodyType = HttpBodyType.Raw;

            // Act
            const result = await fromBody.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeInstanceOf(Buffer);
            expect(result.toString()).toBe(bodyData);
        });
    });

    describe("Missing body data", () => {
        it("should handle empty body gracefully", async () => {
            // Arrange - empty string is not valid JSON, but body-parser may return empty object
            const mockStream = createMockStream("");
            mockRequest = Object.assign(mockStream, {
                body: undefined,
                method: "POST",
                path: "/test",
                url: "/test",
                protocol: "http",
                httpVersion: "1.1",
                ip: "127.0.0.1",
                headers: {
                    "content-type": "application/json",
                    "content-length": "0"
                },
                get: function(name: string) {
                    return this.headers[name.toLowerCase()];
                }
            });
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromBody.allBody = true;
            fromBody.bodyType = HttpBodyType.Json;

            // Act
            const result = await fromBody.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert - body-parser returns empty object for empty content
            expect(result).toBeDefined();
        });

        it("should return undefined when body is missing with named field", async () => {
            // Arrange
            mockRequest = createMockRequest("");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromBody.name = "username";
            fromBody.allBody = false;
            fromBody.bodyType = HttpBodyType.Json;

            // Act
            const result = await fromBody.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeUndefined();
        });

        it("should handle null body value", async () => {
            // Arrange - JSON "null" is a valid value
            mockRequest = createMockRequest("null");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromBody.allBody = true;
            fromBody.bodyType = HttpBodyType.Json;

            // Act
            const result = await fromBody.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert - when body is null, extractor returns undefined
            expect(result).toBeUndefined();
        });

        it("should return undefined when body is empty object and named field requested", async () => {
            // Arrange
            mockRequest = createMockRequest({});
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromBody.name = "username";
            fromBody.allBody = false;
            fromBody.bodyType = HttpBodyType.Json;

            // Act
            const result = await fromBody.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe("Default body type", () => {
        it("should default to JSON body type when not specified", async () => {
            // Arrange
            const bodyData = { test: "data" };
            mockRequest = createMockRequest(bodyData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromBody.allBody = true;
            // Don't set bodyType - should default to JSON

            // Act
            const result = await fromBody.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(bodyData);
        });
    });

    describe("Any body type", () => {
        it("should try all parsers with Any body type", async () => {
            // Arrange
            const bodyData = { test: "data" };
            mockRequest = createMockRequest(bodyData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromBody.allBody = true;
            fromBody.bodyType = HttpBodyType.Any;

            // Act
            const result = await fromBody.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(bodyData);
        });
    });

    describe("Body options", () => {
        it("should accept body parser options", async () => {
            // Arrange
            const bodyData = { test: "data" };
            mockRequest = createMockRequest(bodyData);
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);
            fromBody.allBody = true;
            fromBody.bodyType = HttpBodyType.Json;
            fromBody.bodyOptions = { limit: "1mb" };

            // Act
            const result = await fromBody.extractValueFromHttpEvent(
                mockHttpEvent,
                mockFlexibleResponse,
                {}
            );

            // Assert
            expect(result).toEqual(bodyData);
        });
    });
});
