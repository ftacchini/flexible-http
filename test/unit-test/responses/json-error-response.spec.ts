import "reflect-metadata";
import "jasmine";
import { JsonErrorResponse } from "../../../src/built-ins/responses/json-error-response";
import { Response, NextFunction } from "express";

describe("JsonErrorResponse", () => {
    let mockResponse: jasmine.SpyObj<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        // Create a mock response object with common methods
        mockResponse = jasmine.createSpyObj<Response>("Response", [
            "json",
            "send",
            "sendFile",
            "render",
            "status",
            "set",
            "setHeader"
        ]);

        // Make status return the mock response for chaining
        mockResponse.status.and.returnValue(mockResponse);

        // Create a spy for the next function
        mockNext = jasmine.createSpy("next") as any;
    });

    it("should set status code and call json with error object", async () => {
        // Arrange
        const statusCode = 404;
        const message = "Resource not found";
        const errorResponse = new JsonErrorResponse(statusCode, message);

        // Act
        await errorResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).toHaveBeenCalledWith(statusCode);
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: true,
            statusCode: statusCode,
            message: message
        });
    });

    it("should call next function", async () => {
        // Arrange
        const errorResponse = new JsonErrorResponse(500, "Server error");

        // Act
        await errorResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should use default message for 400 when no message provided", async () => {
        // Arrange
        const errorResponse = new JsonErrorResponse(400);

        // Act
        await errorResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: true,
            statusCode: 400,
            message: "Bad Request"
        });
    });

    it("should use default message for 401 when no message provided", async () => {
        // Arrange
        const errorResponse = new JsonErrorResponse(401);

        // Act
        await errorResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: true,
            statusCode: 401,
            message: "Unauthorized"
        });
    });

    it("should use default message for 403 when no message provided", async () => {
        // Arrange
        const errorResponse = new JsonErrorResponse(403);

        // Act
        await errorResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: true,
            statusCode: 403,
            message: "Forbidden"
        });
    });

    it("should use default message for 404 when no message provided", async () => {
        // Arrange
        const errorResponse = new JsonErrorResponse(404);

        // Act
        await errorResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: true,
            statusCode: 404,
            message: "Not Found"
        });
    });

    it("should use default message for 500 when no message provided", async () => {
        // Arrange
        const errorResponse = new JsonErrorResponse(500);

        // Act
        await errorResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: true,
            statusCode: 500,
            message: "Internal Server Error"
        });
    });

    it("should use default message for 502 when no message provided", async () => {
        // Arrange
        const errorResponse = new JsonErrorResponse(502);

        // Act
        await errorResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: true,
            statusCode: 502,
            message: "Bad Gateway"
        });
    });

    it("should use default message for 503 when no message provided", async () => {
        // Arrange
        const errorResponse = new JsonErrorResponse(503);

        // Act
        await errorResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: true,
            statusCode: 503,
            message: "Service Unavailable"
        });
    });

    it("should use generic 'Error' message for unknown status codes", async () => {
        // Arrange
        const errorResponse = new JsonErrorResponse(418);

        // Act
        await errorResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: true,
            statusCode: 418,
            message: "Error"
        });
    });

    it("should override default message with custom message", async () => {
        // Arrange
        const customMessage = "Custom error message";
        const errorResponse = new JsonErrorResponse(500, customMessage);

        // Act
        await errorResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: true,
            statusCode: 500,
            message: customMessage
        });
    });

    it("should handle multiple error responses with different status codes", async () => {
        // Arrange
        const errorResponse1 = new JsonErrorResponse(400, "Bad input");
        const errorResponse2 = new JsonErrorResponse(500, "Server crashed");

        // Act
        await errorResponse1.writeToHttpResponse(mockResponse, mockNext);
        await errorResponse2.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockNext).toHaveBeenCalledTimes(2);
    });

    it("should not call other response methods", async () => {
        // Arrange
        const errorResponse = new JsonErrorResponse(404, "Not found");

        // Act
        await errorResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.send).not.toHaveBeenCalled();
        expect(mockResponse.sendFile).not.toHaveBeenCalled();
        expect(mockResponse.render).not.toHaveBeenCalled();
    });
});
