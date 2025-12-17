import "reflect-metadata";
import "jasmine";
import { HttpFileResponse } from "../../../src/built-ins/responses/file-response";
import { Response, NextFunction } from "express";

describe("HttpFileResponse", () => {
    let mockResponse: jasmine.SpyObj<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        // Create a mock response object with sendFile method
        mockResponse = jasmine.createSpyObj<Response>("Response", [
            "sendFile",
            "json",
            "send",
            "render",
            "status",
            "set",
            "setHeader"
        ]);

        // Create a spy for the next function
        mockNext = jasmine.createSpy("next") as any;
    });

    it("should call sendFile method with correct path", async () => {
        // Arrange
        const filePath = "/path/to/file.txt";
        const fileResponse = new HttpFileResponse(filePath);

        // Mock sendFile to call the callback with no error
        mockResponse.sendFile.and.callFake(((path: string, options?: any, callback?: any) => {
            const cb = typeof options === 'function' ? options : callback;
            if (cb) cb();
        }) as any);

        // Act
        await fileResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.sendFile).toHaveBeenCalledTimes(1);
        expect(mockResponse.sendFile).toHaveBeenCalledWith(
            filePath,
            undefined,
            jasmine.any(Function)
        );
    });

    it("should call sendFile method with correct path and options", async () => {
        // Arrange
        const filePath = "/path/to/file.txt";
        const options = { root: "/base/path", maxAge: 3600 };
        const fileResponse = new HttpFileResponse(filePath, options);

        // Mock sendFile to call the callback with no error
        mockResponse.sendFile.and.callFake(((path: string, opts?: any, callback?: any) => {
            if (callback) callback();
        }) as any);

        // Act
        await fileResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.sendFile).toHaveBeenCalledTimes(1);
        expect(mockResponse.sendFile).toHaveBeenCalledWith(
            filePath,
            options,
            jasmine.any(Function)
        );
    });

    it("should call next function on successful file send", async () => {
        // Arrange
        const filePath = "/path/to/file.txt";
        const fileResponse = new HttpFileResponse(filePath);

        // Mock sendFile to call the callback with no error
        mockResponse.sendFile.and.callFake(((path: string, options?: any, callback?: any) => {
            const cb = typeof options === 'function' ? options : callback;
            if (cb) cb();
        }) as any);

        // Act
        await fileResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next function with error when file send fails", async () => {
        // Arrange
        const filePath = "/path/to/nonexistent.txt";
        const fileResponse = new HttpFileResponse(filePath);
        const error = new Error("File not found");

        // Mock sendFile to call the callback with an error
        mockResponse.sendFile.and.callFake(((path: string, options?: any, callback?: any) => {
            const cb = typeof options === 'function' ? options : callback;
            if (cb) cb(error);
        }) as any);

        // Act & Assert
        await expectAsync(
            fileResponse.writeToHttpResponse(mockResponse, mockNext)
        ).toBeRejectedWith(error);

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect((mockNext as jasmine.Spy).calls.mostRecent().args[0]).toBe(error);
    });

    it("should handle error callback correctly", async () => {
        // Arrange
        const filePath = "/path/to/file.txt";
        const options = { root: "/base/path" };
        const fileResponse = new HttpFileResponse(filePath, options);
        const error = new Error("Permission denied");

        // Mock sendFile to call the callback with an error
        mockResponse.sendFile.and.callFake(((path: string, opts?: any, callback?: any) => {
            if (callback) callback(error);
        }) as any);

        // Act & Assert
        await expectAsync(
            fileResponse.writeToHttpResponse(mockResponse, mockNext)
        ).toBeRejectedWith(error);

        expect(mockResponse.sendFile).toHaveBeenCalledTimes(1);
        expect((mockNext as jasmine.Spy).calls.mostRecent().args[0]).toBe(error);
    });

    it("should not call other response methods", async () => {
        // Arrange
        const filePath = "/path/to/file.txt";
        const fileResponse = new HttpFileResponse(filePath);

        // Mock sendFile to call the callback with no error
        mockResponse.sendFile.and.callFake(((path: string, options?: any, callback?: any) => {
            const cb = typeof options === 'function' ? options : callback;
            if (cb) cb();
        }) as any);

        // Act
        await fileResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).not.toHaveBeenCalled();
        expect(mockResponse.send).not.toHaveBeenCalled();
        expect(mockResponse.render).not.toHaveBeenCalled();
    });

    it("should resolve promise on successful file send", async () => {
        // Arrange
        const filePath = "/path/to/file.txt";
        const fileResponse = new HttpFileResponse(filePath);

        // Mock sendFile to call the callback with no error
        mockResponse.sendFile.and.callFake(((path: string, options?: any, callback?: any) => {
            const cb = typeof options === 'function' ? options : callback;
            if (cb) cb();
        }) as any);

        // Act & Assert
        await expectAsync(
            fileResponse.writeToHttpResponse(mockResponse, mockNext)
        ).toBeResolved();
    });

    it("should reject promise on file send error", async () => {
        // Arrange
        const filePath = "/path/to/file.txt";
        const fileResponse = new HttpFileResponse(filePath);
        const error = new Error("I/O error");

        // Mock sendFile to call the callback with an error
        mockResponse.sendFile.and.callFake(((path: string, options?: any, callback?: any) => {
            const cb = typeof options === 'function' ? options : callback;
            if (cb) cb(error);
        }) as any);

        // Act & Assert
        await expectAsync(
            fileResponse.writeToHttpResponse(mockResponse, mockNext)
        ).toBeRejectedWith(error);
    });
});
