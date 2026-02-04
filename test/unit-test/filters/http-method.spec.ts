import "reflect-metadata";
import "jasmine";
import { HttpMethod } from "../../../src/built-ins/filters/http-method";
import { HttpEvent } from "../../../src/http-event";
import { RouteProcessor } from "../../../src/helpers/route-processor";
import { Request, Response } from "express";

describe("HttpMethod Filter - Any Verb Support", () => {
    let httpMethod: HttpMethod;
    let routeProcessor: RouteProcessor;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockHttpEvent: HttpEvent;
    let filterBinnacle: { [key: string]: string };

    beforeEach(() => {
        routeProcessor = new RouteProcessor();
        httpMethod = new HttpMethod(routeProcessor);
        filterBinnacle = {};
        mockResponse = { locals: {} } as any;
    });

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

    describe("When method is not set", () => {
        it("should not include method in staticRouting", () => {
            // Arrange
            httpMethod.path = "/api";
            // Don't set method

            // Act
            const staticRouting = httpMethod.staticRouting;

            // Assert
            expect(staticRouting.method).toBeUndefined();
            expect(staticRouting.eventType).toBeDefined();
            expect(staticRouting.routeParts).toBeDefined();
        });

        it("should accept GET request", async () => {
            // Arrange
            httpMethod.path = "/api";
            httpMethod.isLastFilter = true;
            mockRequest = createMockRequest("GET", "/api");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpMethod.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should accept POST request", async () => {
            // Arrange
            httpMethod.path = "/api";
            httpMethod.isLastFilter = true;
            mockRequest = createMockRequest("POST", "/api");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpMethod.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should accept PUT request", async () => {
            // Arrange
            httpMethod.path = "/api";
            httpMethod.isLastFilter = true;
            mockRequest = createMockRequest("PUT", "/api");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpMethod.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should accept DELETE request", async () => {
            // Arrange
            httpMethod.path = "/api";
            httpMethod.isLastFilter = true;
            mockRequest = createMockRequest("DELETE", "/api");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpMethod.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should accept PATCH request", async () => {
            // Arrange
            httpMethod.path = "/api";
            httpMethod.isLastFilter = true;
            mockRequest = createMockRequest("PATCH", "/api");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpMethod.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });

        it("should accept OPTIONS request", async () => {
            // Arrange
            httpMethod.path = "/api";
            httpMethod.isLastFilter = true;
            mockRequest = createMockRequest("OPTIONS", "/api");
            mockHttpEvent = new HttpEvent(mockRequest as Request, mockResponse as Response);

            // Act
            const result = await httpMethod.filterEvent(mockHttpEvent, filterBinnacle);

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("When method is set", () => {
        it("should include method in staticRouting", () => {
            // Arrange
            httpMethod.path = "/api";
            httpMethod.method = "get";

            // Act
            const staticRouting = httpMethod.staticRouting;

            // Assert
            expect(staticRouting.method).toBe("get");
        });
    });
});
