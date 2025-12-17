import "reflect-metadata";
import "jasmine";
import { JsonResponse } from "../../../src/built-ins/responses/json-response";
import { Response, NextFunction } from "express";

describe("JsonResponse", () => {
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

        // Create a spy for the next function
        mockNext = jasmine.createSpy("next") as any;
    });

    it("should call json method with correct data", async () => {
        // Arrange
        const data = { test: "data", value: 123 };
        const jsonResponse = new JsonResponse(data);

        // Act
        await jsonResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(data);
    });

    it("should call next function", async () => {
        // Arrange
        const data = { test: "data" };
        const jsonResponse = new JsonResponse(data);

        // Act
        await jsonResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call json method with string data", async () => {
        // Arrange
        const data = "string response";
        const jsonResponse = new JsonResponse(data);

        // Act
        await jsonResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(data);
    });

    it("should call json method with array data", async () => {
        // Arrange
        const data = [1, 2, 3, 4, 5];
        const jsonResponse = new JsonResponse(data);

        // Act
        await jsonResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(data);
    });

    it("should call json method with null data", async () => {
        // Arrange
        const data = null;
        const jsonResponse = new JsonResponse(data);

        // Act
        await jsonResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(data);
    });

    it("should call json method with undefined data", async () => {
        // Arrange
        const data = undefined;
        const jsonResponse = new JsonResponse(data);

        // Act
        await jsonResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(data);
    });

    it("should call json method with number data", async () => {
        // Arrange
        const data = 42;
        const jsonResponse = new JsonResponse(data);

        // Act
        await jsonResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(data);
    });

    it("should call json method with boolean data", async () => {
        // Arrange
        const data = true;
        const jsonResponse = new JsonResponse(data);

        // Act
        await jsonResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(data);
    });

    it("should call json method with nested object data", async () => {
        // Arrange
        const data = {
            user: {
                name: "John",
                age: 30,
                address: {
                    city: "New York",
                    zip: "10001"
                }
            }
        };
        const jsonResponse = new JsonResponse(data);

        // Act
        await jsonResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(data);
    });

    it("should not call other response methods", async () => {
        // Arrange
        const data = { test: "data" };
        const jsonResponse = new JsonResponse(data);

        // Act
        await jsonResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.send).not.toHaveBeenCalled();
        expect(mockResponse.sendFile).not.toHaveBeenCalled();
        expect(mockResponse.render).not.toHaveBeenCalled();
    });
});
