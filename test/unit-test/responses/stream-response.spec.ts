import "reflect-metadata";
import "jasmine";
import { StreamResponse } from "../../../src/built-ins/responses/stream-response";
import { Response, NextFunction } from "express";
import { Writable } from "stream";

describe("StreamResponse", () => {
    let mockResponse: jasmine.SpyObj<Response>;
    let mockNext: NextFunction;
    let mockStream: jasmine.SpyObj<NodeJS.WritableStream>;

    beforeEach(() => {
        // Create a mock response object with pipe method
        mockResponse = jasmine.createSpyObj<Response>("Response", [
            "pipe",
            "json",
            "send",
            "sendFile",
            "render"
        ]);

        // Create a spy for the next function
        mockNext = jasmine.createSpy("next") as any;

        // Create a mock writable stream
        mockStream = jasmine.createSpyObj<NodeJS.WritableStream>("WritableStream", [
            "write",
            "end",
            "on"
        ]);
    });

    it("should call pipe method with correct stream", async () => {
        // Arrange
        const streamResponse = new StreamResponse(mockStream);

        // Act
        await streamResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.pipe).toHaveBeenCalledTimes(1);
        expect(mockResponse.pipe).toHaveBeenCalledWith(mockStream, undefined);
    });

    it("should call pipe method with stream and options", async () => {
        // Arrange
        const options = { end: true };
        const streamResponse = new StreamResponse(mockStream, options);

        // Act
        await streamResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.pipe).toHaveBeenCalledTimes(1);
        expect(mockResponse.pipe).toHaveBeenCalledWith(mockStream, options);
    });

    it("should call next when end option is true", async () => {
        // Arrange
        const options = { end: true };
        const streamResponse = new StreamResponse(mockStream, options);

        // Act
        await streamResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should not call next when end option is false", async () => {
        // Arrange
        const options = { end: false };
        const streamResponse = new StreamResponse(mockStream, options);

        // Act
        await streamResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should not call next when options are undefined", async () => {
        // Arrange
        const streamResponse = new StreamResponse(mockStream);

        // Act
        await streamResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should not call next when options are provided but end is false", async () => {
        // Arrange
        const options = { end: false };
        const streamResponse = new StreamResponse(mockStream, options);

        // Act
        await streamResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should not call other response methods", async () => {
        // Arrange
        const streamResponse = new StreamResponse(mockStream);

        // Act
        await streamResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).not.toHaveBeenCalled();
        expect(mockResponse.send).not.toHaveBeenCalled();
        expect(mockResponse.sendFile).not.toHaveBeenCalled();
        expect(mockResponse.render).not.toHaveBeenCalled();
    });
});
