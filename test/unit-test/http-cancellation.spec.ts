import "reflect-metadata";
import "jasmine";
import { HttpEvent } from "../../src/http-event";
import { HttpSourceConfig } from "../../src/event-sources/http-abstract-source";
import { Request, Response } from "express";

describe("HTTP Cancellation Support", () => {

    describe("HttpEvent with cancellation token", () => {
        it("should store cancellation token when provided", () => {
            // Arrange
            const abortController = new AbortController();
            const mockRequest: Partial<Request> = {
                method: 'GET',
                path: '/test',
                url: '/test',
                protocol: 'http',
                httpVersion: '1.1',
                ip: '127.0.0.1'
            };
            const mockResponse: Partial<Response> = {};

            // Act
            const httpEvent = new HttpEvent(
                mockRequest as Request,
                mockResponse as Response,
                'test-request-id',
                abortController.signal
            );

            // Assert
            expect(httpEvent.cancellationToken).toBeDefined();
            expect(httpEvent.cancellationToken).toBe(abortController.signal);
            expect(httpEvent.cancellationToken).toBeInstanceOf(AbortSignal);
        });

        it("should have aborted property reflect controller state", () => {
            // Arrange
            const abortController = new AbortController();
            const mockRequest: Partial<Request> = {
                method: 'GET',
                path: '/test',
                url: '/test',
                protocol: 'http',
                httpVersion: '1.1',
                ip: '127.0.0.1'
            };
            const mockResponse: Partial<Response> = {};

            const httpEvent = new HttpEvent(
                mockRequest as Request,
                mockResponse as Response,
                'test-request-id',
                abortController.signal
            );

            // Act & Assert - Before abort
            expect(httpEvent.cancellationToken!.aborted).toBe(false);

            // Abort the controller
            abortController.abort();

            // After abort
            expect(httpEvent.cancellationToken!.aborted).toBe(true);
        });

        it("should support events without cancellation token", () => {
            // Arrange
            const mockRequest: Partial<Request> = {
                method: 'GET',
                path: '/test',
                url: '/test',
                protocol: 'http',
                httpVersion: '1.1',
                ip: '127.0.0.1'
            };
            const mockResponse: Partial<Response> = {};

            // Act
            const httpEvent = new HttpEvent(
                mockRequest as Request,
                mockResponse as Response,
                'test-request-id'
            );

            // Assert
            expect(httpEvent.cancellationToken).toBeUndefined();
        });
    });

    describe("HttpSourceConfig", () => {
        it("should have enableCancellation option", () => {
            // Arrange & Act
            const config: HttpSourceConfig = {
                enableCancellation: true
            };

            // Assert
            expect(config.enableCancellation).toBe(true);
        });

        it("should allow enableCancellation to be false", () => {
            // Arrange & Act
            const config: HttpSourceConfig = {
                enableCancellation: false
            };

            // Assert
            expect(config.enableCancellation).toBe(false);
        });

        it("should allow enableCancellation to be undefined", () => {
            // Arrange & Act
            const config: HttpSourceConfig = {};

            // Assert
            expect(config.enableCancellation).toBeUndefined();
        });
    });
});
