import "reflect-metadata";
import "jasmine";
import { NextResponse } from "../../../src/built-ins/responses/next-response";
import { Response, NextFunction } from "express";

describe("NextResponse", () => {
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

    it("should call next function", async () => {
        // Arrange
        const data = { test: "data" };
        const nextResponse = new NextResponse(data);

        // Act
        await nextResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should not modify the response object", async () => {
        // Arrange
        const data = { test: "data" };
        const nextResponse = new NextResponse(data);

        // Act
        await nextResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).not.toHaveBeenCalled();
        expect(mockResponse.send).not.toHaveBeenCalled();
        expect(mockResponse.sendFile).not.toHaveBeenCalled();
        expect(mockResponse.render).not.toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.set).not.toHaveBeenCalled();
        expect(mockResponse.setHeader).not.toHaveBeenCalled();
    });

    it("should call next function with undefined data", async () => {
        // Arrange
        const nextResponse = new NextResponse(undefined);

        // Act
        await nextResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call next function with null data", async () => {
        // Arrange
        const nextResponse = new NextResponse(null);

        // Act
        await nextResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should not modify response object regardless of data value", async () => {
        // Arrange
        const testCases = [
            { test: "data" },
            undefined,
            null,
            "string data",
            123,
            []
        ];

        for (const data of testCases) {
            // Reset spies
            mockResponse.json.calls.reset();
            mockResponse.send.calls.reset();
            mockResponse.sendFile.calls.reset();
            mockResponse.render.calls.reset();
            mockResponse.status.calls.reset();
            mockResponse.set.calls.reset();
            mockResponse.setHeader.calls.reset();
            (mockNext as any).calls.reset();

            const nextResponse = new NextResponse(data);

            // Act
            await nextResponse.writeToHttpResponse(mockResponse, mockNext);

            // Assert
            expect(mockResponse.json).not.toHaveBeenCalled();
            expect(mockResponse.send).not.toHaveBeenCalled();
            expect(mockResponse.sendFile).not.toHaveBeenCalled();
            expect(mockResponse.render).not.toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.set).not.toHaveBeenCalled();
            expect(mockResponse.setHeader).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledTimes(1);
        }
    });
});
