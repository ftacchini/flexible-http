import "reflect-metadata";
import "jasmine";
import {
    DummyFramework,
    FlexibleApp,
    FlexibleFrameworkModule,
    SilentLoggerModule,
    FlexibleContainer
} from "flexible-core";
import { DependencyContainer } from "tsyringe";
import {
    HttpGet,
    HttpPost,
    HttpModule,
    JsonResponse
} from "../../src";
import * as http from 'http';

const ERROR_TEST_PORT = 3030;

describe("HTTP Error Handling Integration Tests", () => {
    let app: FlexibleApp;
    let framework: DummyFramework;

    beforeEach(async () => {
        framework = new DummyFramework();
        // Ensure any previous app is stopped
        if (app) {
            try {
                await app.stop();
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (e) {
                // App might already be stopped
            }
            app = null;
        }
    });

    afterEach(async () => {
        if (app) {
            await app.stop();
            // Give the port time to be released
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    });

    // Helper function to make HTTP requests
    function makeRequest(
        method: string,
        path: string,
        body?: any,
        headers?: { [key: string]: string }
    ): Promise<{ statusCode: number; body: string; headers: any }> {
        return new Promise((resolve, reject) => {
            const options: http.RequestOptions = {
                hostname: 'localhost',
                port: ERROR_TEST_PORT,
                path: path,
                method: method,
                headers: headers || {}
            };

            const req = http.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode || 0,
                        body: data,
                        headers: res.headers
                    });
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (body) {
                const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
                req.write(bodyStr);
            }

            req.end();
        });
    }

    // Helper to create and start app
    async function createAndStartApp(): Promise<void> {
        // Ensure any existing app is stopped first
        if (app) {
            try {
                await app.stop();
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (e) {
                // App might already be stopped
            }
        }

        const frameworkModule: FlexibleFrameworkModule = {
            getInstance: (container: FlexibleContainer) => framework,
            register: (container: DependencyContainer) => { },
            registerIsolated: (container: DependencyContainer) => { }
        };

        // Create Express app with silent error handler to avoid polluting test output
        const express = require('express');
        const expressApp = express();

        // Add silent error handler middleware (must be last)
        expressApp.use((err: any, req: any, res: any, next: any) => {
            // Silently handle errors - just send 500 status
            if (!res.headersSent) {
                res.status(500).send('Internal Server Error');
            }
        });

        const eventSource = HttpModule.builder()
            .withPort(ERROR_TEST_PORT)
            .withApplication(expressApp)
            .build();

        app = FlexibleApp.builder()
            .withLogger(new SilentLoggerModule())
            .addEventSource(eventSource)
            .addFramework(frameworkModule)
            .createApp();

        await app.run();
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    describe("Unexpected Exceptions", () => {
        it("Should return 500 status code when middleware throws an Error", async () => {
            // ARRANGE
            const path = '/throw-error';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            throw new Error("Unexpected error occurred");
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            expect(response.statusCode).toBe(500);
        });

        it("Should return 500 status code when middleware throws a string", async () => {
            // ARRANGE
            const path = '/throw-string';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            throw "String error message";
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            expect(response.statusCode).toBe(500);
        });

        it("Should return 500 status code when middleware throws an object", async () => {
            // ARRANGE
            const path = '/throw-object';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            throw { code: 'CUSTOM_ERROR', message: 'Something went wrong' };
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            expect(response.statusCode).toBe(500);
        });

        it("Should return 500 status code when middleware throws null", async () => {
            // ARRANGE
            const path = '/throw-null';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            throw null;
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            expect(response.statusCode).toBe(500);
        });

        it("Should return 500 status code when middleware throws undefined", async () => {
            // ARRANGE
            const path = '/throw-undefined';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            throw undefined;
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            expect(response.statusCode).toBe(500);
        });

        it("Should return 500 status code when middleware has a runtime error (TypeError)", async () => {
            // ARRANGE
            const path = '/runtime-error';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            // Intentionally cause a TypeError
                            const obj: any = null;
                            return obj.property.nested;
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            expect(response.statusCode).toBe(500);
        });

        it("Should return 500 status code when middleware has a ReferenceError", async () => {
            // ARRANGE
            const path = '/reference-error';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            // Intentionally reference undefined variable
                            // @ts-ignore - intentionally causing error
                            return undefinedVariable.someProperty;
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            expect(response.statusCode).toBe(500);
        });

        it("Should return 500 status code when Promise rejects in middleware", async () => {
            // ARRANGE
            const path = '/promise-rejection';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return Promise.reject(new Error("Promise was rejected"));
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            expect(response.statusCode).toBe(500);
        });

        it("Should return 500 status code for POST requests with exceptions", async () => {
            // ARRANGE
            const path = '/post-error';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpPost,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            throw new Error("POST request failed");
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('POST', path, { data: 'test' });

            // ASSERT
            expect(response.statusCode).toBe(500);
        });

        it("Should return 500 when error occurs in second middleware of chain", async () => {
            // ARRANGE
            const path = '/chained-error';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [
                    {
                        // First middleware succeeds
                        activationContext: {
                            activate: async () => {
                                return new JsonResponse({ step: 1 });
                            }
                        },
                        extractorRecipes: {}
                    },
                    {
                        // Second middleware throws error
                        activationContext: {
                            activate: async () => {
                                throw new Error("Error in second middleware");
                            }
                        },
                        extractorRecipes: {}
                    }
                ]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            expect(response.statusCode).toBe(500);
        });

        it("Should return 500 when custom Error subclass is thrown", async () => {
            // ARRANGE
            const path = '/custom-error';

            class CustomApplicationError extends Error {
                constructor(message: string, public code: string) {
                    super(message);
                    this.name = 'CustomApplicationError';
                }
            }

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            throw new CustomApplicationError("Custom error occurred", "ERR_CUSTOM");
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            expect(response.statusCode).toBe(500);
        });

        it("Should return 500 when synchronous exception occurs", async () => {
            // ARRANGE
            const path = '/sync-error';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: () => {
                            // Synchronous throw (not async)
                            throw new Error("Synchronous error");
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            expect(response.statusCode).toBe(500);
        });
    });

    describe("Error Handling with Different HTTP Methods", () => {
        it("Should return 500 for GET request with exception", async () => {
            // ARRANGE
            const path = '/get-error';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            throw new Error("GET error");
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            expect(response.statusCode).toBe(500);
        });

        it("Should return 500 for POST request with exception", async () => {
            // ARRANGE
            const path = '/post-error-method';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpPost,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            throw new Error("POST error");
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('POST', path, { test: 'data' });

            // ASSERT
            expect(response.statusCode).toBe(500);
        });
    });

    describe("Successful Requests (Control Tests)", () => {
        it("Should return 200 when no exception occurs", async () => {
            // ARRANGE
            const path = '/success';
            const expectedData = { status: 'success' };

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return new JsonResponse(expectedData);
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            expect(response.statusCode).toBe(200);
            const result = JSON.parse(response.body);
            expect(result).toEqual(expectedData);
        });

        it("Should return 200 when middleware completes successfully after handling potential error", async () => {
            // ARRANGE
            const path = '/handled-error';
            const expectedData = { status: 'recovered' };

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            try {
                                // Simulate an operation that might fail
                                const obj: any = null;
                                obj.property.nested;
                            } catch (error) {
                                // Handle the error gracefully
                                return new JsonResponse(expectedData);
                            }
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            expect(response.statusCode).toBe(200);
            const result = JSON.parse(response.body);
            expect(result).toEqual(expectedData);
        });
    });
});
