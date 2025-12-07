import "reflect-metadata";
import "jasmine";
import {
    DummyFramework,
    FlexibleApp,
    FlexibleFrameworkModule,
    FlexibleAppBuilder,
    SilentLoggerModule
} from "flexible-core";
import { ContainerModule } from "inversify";
import {
    HttpGet,
    HttpPost,
    HttpDelete,
    HttpPatch,
    HttpHead,
    HttpMethod,
    HttpModuleBuilder
} from "../../src";
import * as http from 'http';

const FILTER_TEST_PORT = 3020;

describe("HTTP Filters Integration Tests", () => {
    let app: FlexibleApp;
    let framework: DummyFramework;

    beforeEach(async () => {
        framework = new DummyFramework();
    });

    afterEach(async () => {
        if (app) {
            await app.stop();
            // Give the port time to be released
            await new Promise(resolve => setTimeout(resolve, 500));
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
                port: FILTER_TEST_PORT,
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
        const frameworkModule: FlexibleFrameworkModule = {
            getInstance: () => framework,
            container: new ContainerModule(() => { }),
            isolatedContainer: new ContainerModule(() => { })
        };

        const eventSource = HttpModuleBuilder.instance
            .withPort(FILTER_TEST_PORT)
            .build();

        app = FlexibleAppBuilder.instance
            .withLogger(new SilentLoggerModule())
            .addEventSource(eventSource)
            .addFramework(frameworkModule)
            .createApp();

        await app.run();
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    describe("HttpGet Filter", () => {
        it("Should accept GET requests matching the route", async () => {
            // ARRANGE
            const path = '/get-endpoint';
            const expected = { method: 'GET', success: true };

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return expected;
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
            expect(result).toEqual(expected);
        });

        it("Should reject POST requests to GET-only route", async () => {
            // ARRANGE
            const path = '/get-only';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return { success: true };
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('POST', path);

            // ASSERT
            // Should get 404 since no route matches POST to this path
            expect(response.statusCode).toBe(404);
        });
    });

    describe("HttpPost Filter", () => {
        it("Should accept POST requests matching the route", async () => {
            // ARRANGE
            const path = '/post-endpoint';
            const expected = { method: 'POST', success: true };

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpPost,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return expected;
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('POST', path, { data: 'test' });

            // ASSERT
            expect(response.statusCode).toBe(200);
            const result = JSON.parse(response.body);
            expect(result).toEqual(expected);
        });

        it("Should reject GET requests to POST-only route", async () => {
            // ARRANGE
            const path = '/post-only';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpPost,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return { success: true };
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            // Should get 404 since no route matches GET to this path
            expect(response.statusCode).toBe(404);
        });
    });

    describe("HttpDelete Filter", () => {
        it("Should accept DELETE requests matching the route", async () => {
            // ARRANGE
            const path = '/delete-endpoint';
            const expected = { method: 'DELETE', success: true };

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpDelete,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return expected;
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('DELETE', path);

            // ASSERT
            expect(response.statusCode).toBe(200);
            const result = JSON.parse(response.body);
            expect(result).toEqual(expected);
        });

        it("Should reject GET requests to DELETE-only route", async () => {
            // ARRANGE
            const path = '/delete-only';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpDelete,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return { success: true };
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            // Should get 404 since no route matches GET to this path
            expect(response.statusCode).toBe(404);
        });
    });

    describe("HttpPatch Filter", () => {
        it("Should accept PATCH requests matching the route", async () => {
            // ARRANGE
            const path = '/patch-endpoint';
            const expected = { method: 'PATCH', success: true };

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpPatch,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return expected;
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('PATCH', path, { data: 'update' });

            // ASSERT
            expect(response.statusCode).toBe(200);
            const result = JSON.parse(response.body);
            expect(result).toEqual(expected);
        });

        it("Should reject POST requests to PATCH-only route", async () => {
            // ARRANGE
            const path = '/patch-only';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpPatch,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return { success: true };
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('POST', path);

            // ASSERT
            // Should get 404 since no route matches POST to this path
            expect(response.statusCode).toBe(404);
        });
    });

    describe("HttpHead Filter", () => {
        it("Should accept HEAD requests matching the route", async () => {
            // ARRANGE
            const path = '/head-endpoint';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpHead,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return { method: 'HEAD', success: true };
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('HEAD', path);

            // ASSERT
            expect(response.statusCode).toBe(200);
            // HEAD requests should not return a body
            expect(response.body).toBe('');
        });

        it("Should reject GET requests to HEAD-only route", async () => {
            // ARRANGE
            const path = '/head-only';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpHead,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return { success: true };
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            // Should get 404 since no route matches GET to this path
            expect(response.statusCode).toBe(404);
        });
    });

    describe("Path Matching", () => {
        it("Should reject requests with non-matching paths", async () => {
            // ARRANGE
            const path = '/specific-path';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return { success: true };
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', '/different-path');

            // ASSERT
            // Should get 404 since path doesn't match
            expect(response.statusCode).toBe(404);
        });

        it("Should handle path parameters correctly", async () => {
            // ARRANGE
            const path = '/users/:userId';
            const expected = { userId: '123' };

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return expected;
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', '/users/123');

            // ASSERT
            expect(response.statusCode).toBe(200);
            const result = JSON.parse(response.body);
            expect(result).toEqual(expected);
        });
    });

    describe("Nested Route Path Composition", () => {
        it("Should correctly combine nested route paths", async () => {
            // ARRANGE
            const path1 = '/api';
            const path2 = '/users';
            const expected = { nested: true, success: true };

            framework.addPipelineDefinition({
                filterStack: [
                    {
                        type: HttpMethod,
                        configuration: <any>{ path: path1 }
                    },
                    {
                        type: HttpGet,
                        configuration: <any>{ path: path2 }
                    }
                ],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return expected;
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', '/api/users');

            // ASSERT
            expect(response.statusCode).toBe(200);
            const result = JSON.parse(response.body);
            expect(result).toEqual(expected);
        });

        it("Should handle multiple nested paths with parameters", async () => {
            // ARRANGE
            const path1 = '/api/v1';
            const path2 = '/users/:userId';
            const path3 = '/posts/:postId';
            const expected = { deeply: 'nested', success: true };

            framework.addPipelineDefinition({
                filterStack: [
                    {
                        type: HttpMethod,
                        configuration: <any>{ path: path1 }
                    },
                    {
                        type: HttpMethod,
                        configuration: <any>{ path: path2 }
                    },
                    {
                        type: HttpGet,
                        configuration: <any>{ path: path3 }
                    }
                ],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return expected;
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', '/api/v1/users/123/posts/456');

            // ASSERT
            expect(response.statusCode).toBe(200);
            const result = JSON.parse(response.body);
            expect(result).toEqual(expected);
        });

        it("Should reject requests that don't match nested path structure", async () => {
            // ARRANGE
            const path1 = '/api';
            const path2 = '/users';

            framework.addPipelineDefinition({
                filterStack: [
                    {
                        type: HttpMethod,
                        configuration: <any>{ path: path1 }
                    },
                    {
                        type: HttpGet,
                        configuration: <any>{ path: path2 }
                    }
                ],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return { success: true };
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT - Try to access just /api without /users
            const response = await makeRequest('GET', '/api');

            // ASSERT
            // Should get 404 since the full nested path is required
            expect(response.statusCode).toBe(404);
        });
    });

    describe("Multiple Routes", () => {
        it("Should handle multiple routes with different methods", async () => {
            // ARRANGE
            const path = '/resource';
            const getExpected = { method: 'GET' };
            const postExpected = { method: 'POST' };

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return getExpected;
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpPost,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return postExpected;
                        }
                    },
                    extractorRecipes: {}
                }]
            });

            await createAndStartApp();

            // ACT
            const getResponse = await makeRequest('GET', path);
            const postResponse = await makeRequest('POST', path);

            // ASSERT
            expect(getResponse.statusCode).toBe(200);
            expect(JSON.parse(getResponse.body)).toEqual(getExpected);

            expect(postResponse.statusCode).toBe(200);
            expect(JSON.parse(postResponse.body)).toEqual(postExpected);
        });
    });
});
