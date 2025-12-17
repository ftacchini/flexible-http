import "reflect-metadata";
import "jasmine";
import * as fc from "fast-check";
import { HttpEvent } from "../../src/http-event";
import { Request, Response } from "express";

describe("HTTP Cancellation Property-Based Tests", () => {

    /**
     * Feature: timeout-cancellation-support, Property 15: HTTP AbortSignal creation
     * Validates: Requirements 7.1
     */
    it("Property 15: HTTP AbortSignal creation", () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 50 }), // Request path
                fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'), // HTTP method
                fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }), // Request ID
                (path, method, requestId) => {
                    // Arrange - Create an AbortController
                    const abortController = new AbortController();
                    const cancellationToken = abortController.signal;

                    // Create mock request and response
                    const mockRequest: Partial<Request> = {
                        method,
                        path: `/${path}`,
                        url: `/${path}`,
                        protocol: 'http',
                        httpVersion: '1.1',
                        ip: '127.0.0.1'
                    };

                    const mockResponse: Partial<Response> = {
                        statusCode: 200
                    };

                    // Act - Create HttpEvent with cancellation token
                    const httpEvent = new HttpEvent(
                        mockRequest as Request,
                        mockResponse as Response,
                        requestId,
                        cancellationToken
                    );

                    // Assert - Verify the AbortSignal is attached to the event
                    return httpEvent.cancellationToken === cancellationToken &&
                           httpEvent.cancellationToken instanceof AbortSignal &&
                           httpEvent.cancellationToken.aborted === false;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Feature: timeout-cancellation-support, Property 16: HTTP disconnect signaling
     * Validates: Requirements 7.2
     */
    it("Property 16: HTTP disconnect signaling", () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 50 }), // Request path
                fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'), // HTTP method
                fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }), // Request ID
                (path, method, requestId) => {
                    // Arrange - Create an AbortController
                    const abortController = new AbortController();
                    const cancellationToken = abortController.signal;

                    // Create mock request and response
                    const mockRequest: Partial<Request> = {
                        method,
                        path: `/${path}`,
                        url: `/${path}`,
                        protocol: 'http',
                        httpVersion: '1.1',
                        ip: '127.0.0.1'
                    };

                    const mockResponse: Partial<Response> = {
                        statusCode: 200
                    };

                    // Act - Create HttpEvent with cancellation token
                    const httpEvent = new HttpEvent(
                        mockRequest as Request,
                        mockResponse as Response,
                        requestId,
                        cancellationToken
                    );

                    // Verify token is not aborted initially
                    const notAbortedBefore = !httpEvent.cancellationToken!.aborted;

                    // Simulate client disconnect by aborting the controller
                    abortController.abort();

                    // Assert - Verify the signal is now aborted
                    const abortedAfter = httpEvent.cancellationToken!.aborted;

                    return notAbortedBefore && abortedAfter;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Feature: timeout-cancellation-support, Property 17: HTTP cancellation integration
     * Validates: Requirements 7.4
     */
    it("Property 17: HTTP cancellation integration", () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 50 }), // Request path
                fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'), // HTTP method
                fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }), // Request ID
                fc.boolean(), // Whether to abort before checking
                (path, method, requestId, shouldAbort) => {
                    // Arrange - Create an AbortController
                    const abortController = new AbortController();
                    const cancellationToken = abortController.signal;

                    // Create mock request and response
                    const mockRequest: Partial<Request> = {
                        method,
                        path: `/${path}`,
                        url: `/${path}`,
                        protocol: 'http',
                        httpVersion: '1.1',
                        ip: '127.0.0.1'
                    };

                    const mockResponse: Partial<Response> = {
                        statusCode: 200
                    };

                    // Act - Create HttpEvent with cancellation token
                    const httpEvent = new HttpEvent(
                        mockRequest as Request,
                        mockResponse as Response,
                        requestId,
                        cancellationToken
                    );

                    // Optionally abort to simulate client disconnect
                    if (shouldAbort) {
                        abortController.abort();
                    }

                    // Simulate cancellation middleware checking the token
                    const cancellationDetected = httpEvent.cancellationToken!.aborted;

                    // Assert - Verify cancellation detection matches abort state
                    return cancellationDetected === shouldAbort &&
                           httpEvent.cancellationToken instanceof AbortSignal;
                }
            ),
            { numRuns: 100 }
        );
    });

    it("should support events without cancellation tokens (backward compatibility)", () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 50 }), // Request path
                fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'), // HTTP method
                fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }), // Request ID
                (path, method, requestId) => {
                    // Arrange - Create mock request and response
                    const mockRequest: Partial<Request> = {
                        method,
                        path: `/${path}`,
                        url: `/${path}`,
                        protocol: 'http',
                        httpVersion: '1.1',
                        ip: '127.0.0.1'
                    };

                    const mockResponse: Partial<Response> = {
                        statusCode: 200
                    };

                    // Act - Create HttpEvent without cancellation token
                    const httpEvent = new HttpEvent(
                        mockRequest as Request,
                        mockResponse as Response,
                        requestId
                    );

                    // Assert - Verify the event is valid and cancellationToken is undefined
                    return httpEvent.cancellationToken === undefined &&
                           httpEvent.eventType === 'HttpEvent' &&
                           httpEvent.requestId === requestId;
                }
            ),
            { numRuns: 100 }
        );
    });
});
