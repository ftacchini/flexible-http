import "reflect-metadata";
import "jasmine";
import { AcceptedResponse } from "../../../src/built-ins/responses/accepted-response";
import { Response, NextFunction } from "express";

describe("AcceptedResponse", () => {
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
            "setHeader",
            "format"
        ]);

        // Create a spy for the next function
        mockNext = jasmine.createSpy("next") as any;
    });

    it("should call format method with data", async () => {
        // Arrange
        const data = { test: "data", value: 123 };
        const acceptedResponse = new AcceptedResponse(data);

        // Act
        await acceptedResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.format).toHaveBeenCalledTimes(1);
        expect(mockResponse.format).toHaveBeenCalledWith({
            'application/json': jasmine.any(Function),
            'default': jasmine.any(Function)
        });
    });

    it("should call next function", async () => {
        // Arrange
        const data = { test: "data" };
        const acceptedResponse = new AcceptedResponse(data);

        // Act
        await acceptedResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should not call format method with undefined data", async () => {
        // Arrange
        const acceptedResponse = new AcceptedResponse(undefined);

        // Act
        await acceptedResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.format).not.toHaveBeenCalled();
    });

    it("should call next function even with undefined data", async () => {
        // Arrange
        const acceptedResponse = new AcceptedResponse(undefined);

        // Act
        await acceptedResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call json method when application/json format is selected", async () => {
        // Arrange
        const data = { test: "data", value: 123 };
        const acceptedResponse = new AcceptedResponse(data);

        // Mock format to call the json handler
        mockResponse.format.and.callFake((handlers: any) => {
            handlers['application/json']();
            return mockResponse;
        });

        // Act
        await acceptedResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(data);
    });

    it("should call send method when default format is selected", async () => {
        // Arrange
        const data = { test: "data", value: 123 };
        const acceptedResponse = new AcceptedResponse(data);

        // Mock format to call the default handler
        mockResponse.format.and.callFake((handlers: any) => {
            handlers['default']();
            return mockResponse;
        });

        // Act
        await acceptedResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.send).toHaveBeenCalledTimes(1);
        expect(mockResponse.send).toHaveBeenCalledWith(data);
    });

    it("should call format method with string data", async () => {
        // Arrange
        const data = "string response";
        const acceptedResponse = new AcceptedResponse(data);

        // Act
        await acceptedResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.format).toHaveBeenCalledTimes(1);
    });

    it("should call format method with array data", async () => {
        // Arrange
        const data = [1, 2, 3, 4, 5];
        const acceptedResponse = new AcceptedResponse(data);

        // Act
        await acceptedResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.format).toHaveBeenCalledTimes(1);
    });

    it("should call format method with null data", async () => {
        // Arrange
        const data = null;
        const acceptedResponse = new AcceptedResponse(data);

        // Act
        await acceptedResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.format).toHaveBeenCalledTimes(1);
    });

    it("should call format method with number data", async () => {
        // Arrange
        const data = 42;
        const acceptedResponse = new AcceptedResponse(data);

        // Act
        await acceptedResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.format).toHaveBeenCalledTimes(1);
    });

    it("should call format method with boolean data", async () => {
        // Arrange
        const data = true;
        const acceptedResponse = new AcceptedResponse(data);

        // Act
        await acceptedResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.format).toHaveBeenCalledTimes(1);
    });

    it("should call format method with nested object data", async () => {
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
        const acceptedResponse = new AcceptedResponse(data);

        // Act
        await acceptedResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.format).toHaveBeenCalledTimes(1);
    });

    it("should not call other response methods directly", async () => {
        // Arrange
        const data = { test: "data" };
        const acceptedResponse = new AcceptedResponse(data);

        // Act
        await acceptedResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        // json and send should not be called directly (only through format handlers)
        expect(mockResponse.sendFile).not.toHaveBeenCalled();
        expect(mockResponse.render).not.toHaveBeenCalled();
    });
});
