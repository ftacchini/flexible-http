import "reflect-metadata";
import "jasmine";
import { EjsResponse } from "../../../src/responses/ejs-response";
import { Response, NextFunction } from "express";

describe("EjsResponse", () => {
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

    it("should call render method with correct template path and data", async () => {
        // Arrange
        const templatePath = "views/template.ejs";
        const data = { title: "Test Page", content: "Hello World" };
        const ejsResponse = new EjsResponse(templatePath, data);

        // Act
        await ejsResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.render).toHaveBeenCalledTimes(1);
        expect(mockResponse.render).toHaveBeenCalledWith(templatePath, data);
    });

    it("should call next function", async () => {
        // Arrange
        const templatePath = "views/template.ejs";
        const data = { title: "Test Page" };
        const ejsResponse = new EjsResponse(templatePath, data);

        // Act
        await ejsResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should call render method with object data", async () => {
        // Arrange
        const templatePath = "views/user.ejs";
        const data = {
            user: {
                name: "John Doe",
                email: "john@example.com",
                age: 30
            }
        };
        const ejsResponse = new EjsResponse(templatePath, data);

        // Act
        await ejsResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.render).toHaveBeenCalledTimes(1);
        expect(mockResponse.render).toHaveBeenCalledWith(templatePath, data);
    });

    it("should call render method with array data", async () => {
        // Arrange
        const templatePath = "views/list.ejs";
        const data = { items: [1, 2, 3, 4, 5] };
        const ejsResponse = new EjsResponse(templatePath, data);

        // Act
        await ejsResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.render).toHaveBeenCalledTimes(1);
        expect(mockResponse.render).toHaveBeenCalledWith(templatePath, data);
    });

    it("should call render method with null data", async () => {
        // Arrange
        const templatePath = "views/empty.ejs";
        const data = null;
        const ejsResponse = new EjsResponse(templatePath, data);

        // Act
        await ejsResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.render).toHaveBeenCalledTimes(1);
        expect(mockResponse.render).toHaveBeenCalledWith(templatePath, data);
    });

    it("should call render method with undefined data", async () => {
        // Arrange
        const templatePath = "views/empty.ejs";
        const data = undefined;
        const ejsResponse = new EjsResponse(templatePath, data);

        // Act
        await ejsResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.render).toHaveBeenCalledTimes(1);
        expect(mockResponse.render).toHaveBeenCalledWith(templatePath, data);
    });

    it("should call render method with nested object data", async () => {
        // Arrange
        const templatePath = "views/profile.ejs";
        const data = {
            user: {
                name: "Jane Smith",
                profile: {
                    bio: "Software Developer",
                    location: {
                        city: "San Francisco",
                        country: "USA"
                    }
                }
            }
        };
        const ejsResponse = new EjsResponse(templatePath, data);

        // Act
        await ejsResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.render).toHaveBeenCalledTimes(1);
        expect(mockResponse.render).toHaveBeenCalledWith(templatePath, data);
    });

    it("should call render method with different template paths", async () => {
        // Arrange
        const templatePath1 = "views/home.ejs";
        const templatePath2 = "templates/about.ejs";
        const data = { title: "Page" };
        const ejsResponse1 = new EjsResponse(templatePath1, data);
        const ejsResponse2 = new EjsResponse(templatePath2, data);

        // Act
        await ejsResponse1.writeToHttpResponse(mockResponse, mockNext);
        await ejsResponse2.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.render).toHaveBeenCalledTimes(2);
        expect(mockResponse.render).toHaveBeenCalledWith(templatePath1, data);
        expect(mockResponse.render).toHaveBeenCalledWith(templatePath2, data);
    });

    it("should not call other response methods", async () => {
        // Arrange
        const templatePath = "views/template.ejs";
        const data = { title: "Test" };
        const ejsResponse = new EjsResponse(templatePath, data);

        // Act
        await ejsResponse.writeToHttpResponse(mockResponse, mockNext);

        // Assert
        expect(mockResponse.json).not.toHaveBeenCalled();
        expect(mockResponse.send).not.toHaveBeenCalled();
        expect(mockResponse.sendFile).not.toHaveBeenCalled();
    });
});
