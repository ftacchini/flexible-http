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
    HttpModule,
    HttpModuleBuilder,
    FromBody,
    FromHeaders,
    FromPath,
    FromQuery,
    FromLocals,
    ExpressRequest,
    HttpBodyType,
    NextResponse,
    ToLocalsResponse
} from "../../src";
import * as http from 'http';

const EXTRACTOR_TEST_PORT = 3010;

describe("HTTP Extractors Integration Tests", () => {
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
                port: EXTRACTOR_TEST_PORT,
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
            .withPort(EXTRACTOR_TEST_PORT)
            .build();

        app = FlexibleAppBuilder.instance
            .withLogger(new SilentLoggerModule())
            .addEventSource(eventSource)
            .addFramework(frameworkModule)
            .createApp();

        await app.run();
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    describe("FromBody Extractor", () => {
        it("Should extract JSON body data with allBody flag", async () => {
            // ARRANGE
            const path = '/json-body';
            const requestBody = { name: 'test', value: 123 };

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpPost,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async (contextBinnacle: any, body: any) => {
                            return { extracted: body };
                        }
                    },
                    extractorRecipes: {
                        0: {
                            type: FromBody,
                            configuration: <any>{
                                allBody: true,
                                bodyType: HttpBodyType.Json
                            }
                        }
                    }
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('POST', path, requestBody, {
                'Content-Type': 'application/json'
            });

            // ASSERT
            const result = JSON.parse(response.body);
            expect(result.extracted).toEqual(requestBody);
        });

        it("Should extract named field from JSON body", async () => {
            // ARRANGE
            const path = '/json-field';
            const requestBody = { name: 'test', value: 123 };

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpPost,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async (contextBinnacle: any, name: string) => {
                            return { extractedName: name };
                        }
                    },
                    extractorRecipes: {
                        0: {
                            type: FromBody,
                            configuration: <any>{
                                name: 'name',
                                bodyType: HttpBodyType.Json
                            }
                        }
                    }
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('POST', path, requestBody, {
                'Content-Type': 'application/json'
            });

            // ASSERT
            const result = JSON.parse(response.body);
            expect(result.extractedName).toEqual('test');
        });

        it("Should extract URL-encoded body data", async () => {
            // ARRANGE
            const path = '/urlencoded-body';
            const requestBody = 'name=test&value=123';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpPost,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async (contextBinnacle: any, body: any) => {
                            return { extracted: body };
                        }
                    },
                    extractorRecipes: {
                        0: {
                            type: FromBody,
                            configuration: <any>{
                                allBody: true,
                                bodyType: HttpBodyType.Urlencoded
                            }
                        }
                    }
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('POST', path, requestBody, {
                'Content-Type': 'application/x-www-form-urlencoded'
            });

            // ASSERT
            const result = JSON.parse(response.body);
            expect(result.extracted.name).toEqual('test');
            expect(result.extracted.value).toEqual('123');
        });

        it("Should extract text body data", async () => {
            // ARRANGE
            const path = '/text-body';
            const requestBody = 'plain text content';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpPost,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async (contextBinnacle: any, body: any) => {
                            return { extracted: body };
                        }
                    },
                    extractorRecipes: {
                        0: {
                            type: FromBody,
                            configuration: <any>{
                                allBody: true,
                                bodyType: HttpBodyType.Text
                            }
                        }
                    }
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('POST', path, requestBody, {
                'Content-Type': 'text/plain'
            });

            // ASSERT
            const result = JSON.parse(response.body);
            expect(result.extracted).toEqual(requestBody);
        });
    });

    describe("FromHeaders Extractor", () => {
        it("Should extract all headers with allHeaders flag", async () => {
            // ARRANGE
            const path = '/all-headers';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async (contextBinnacle: any, headers: any) => {
                            return {
                                hasCustomHeader: headers && headers['x-custom-header'] !== undefined,
                                hasUserAgent: headers && headers['user-agent'] !== undefined
                            };
                        }
                    },
                    extractorRecipes: {
                        0: {
                            type: FromHeaders,
                            configuration: <any>{
                                allHeaders: true
                            }
                        }
                    }
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path, undefined, {
                'X-Custom-Header': 'custom-value',
                'User-Agent': 'test-agent'
            });

            // ASSERT
            const result = JSON.parse(response.body);
            expect(result.hasCustomHeader).toBe(true);
            expect(result.hasUserAgent).toBe(true);
        });

        it("Should extract specific named header", async () => {
            // ARRANGE
            const path = '/named-header';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async (contextBinnacle: any, customHeader: string) => {
                            return { extractedHeader: customHeader };
                        }
                    },
                    extractorRecipes: {
                        0: {
                            type: FromHeaders,
                            configuration: <any>{
                                name: 'x-custom-header'
                            }
                        }
                    }
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path, undefined, {
                'X-Custom-Header': 'my-custom-value'
            });

            // ASSERT
            const result = JSON.parse(response.body);
            expect(result.extractedHeader).toEqual('my-custom-value');
        });
    });

    describe("FromPath Extractor", () => {
        it("Should extract all path parameters with allPath flag", async () => {
            // ARRANGE
            const path = '/users/:userId/posts/:postId';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async (contextBinnacle: any, pathParams: any) => {
                            return { extracted: pathParams };
                        }
                    },
                    extractorRecipes: {
                        0: {
                            type: FromPath,
                            configuration: <any>{
                                allPath: true
                            }
                        }
                    }
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', '/users/123/posts/456');

            // ASSERT
            const result = JSON.parse(response.body);
            expect(result.extracted.userId).toEqual('123');
            expect(result.extracted.postId).toEqual('456');
        });

        it("Should extract specific named path parameter", async () => {
            // ARRANGE
            const path = '/users/:userId/profile';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async (contextBinnacle: any, userId: string) => {
                            return { extractedUserId: userId };
                        }
                    },
                    extractorRecipes: {
                        0: {
                            type: FromPath,
                            configuration: <any>{
                                name: 'userId'
                            }
                        }
                    }
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', '/users/789/profile');

            // ASSERT
            const result = JSON.parse(response.body);
            expect(result.extractedUserId).toEqual('789');
        });
    });

    describe("FromQuery Extractor", () => {
        it("Should extract all query parameters with allQuery flag", async () => {
            // ARRANGE
            const path = '/search';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async (contextBinnacle: any, queryParams: any) => {
                            return { extracted: queryParams };
                        }
                    },
                    extractorRecipes: {
                        0: {
                            type: FromQuery,
                            configuration: <any>{
                                allQuery: true
                            }
                        }
                    }
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', '/search?q=test&limit=10&sort=asc');

            // ASSERT
            const result = JSON.parse(response.body);
            expect(result.extracted.q).toEqual('test');
            expect(result.extracted.limit).toEqual('10');
            expect(result.extracted.sort).toEqual('asc');
        });

        it("Should extract specific named query parameter", async () => {
            // ARRANGE
            const path = '/search';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async (contextBinnacle: any, searchQuery: string) => {
                            return { extractedQuery: searchQuery };
                        }
                    },
                    extractorRecipes: {
                        0: {
                            type: FromQuery,
                            configuration: <any>{
                                name: 'q'
                            }
                        }
                    }
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', '/search?q=typescript&limit=5');

            // ASSERT
            const result = JSON.parse(response.body);
            expect(result.extractedQuery).toEqual('typescript');
        });
    });

    describe("FromLocals Extractor", () => {
        xit("Should extract all locals with allLocals flag", async () => {
            // ARRANGE
            const path = '/with-locals';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [
                    {
                        // First middleware sets locals
                        activationContext: {
                            activate: async (contextBinnacle: any) => {
                                return new ToLocalsResponse({
                                    user: 'john',
                                    role: 'admin'
                                });
                            }
                        },
                        extractorRecipes: {}
                    },
                    {
                        // Second middleware extracts locals
                        activationContext: {
                            activate: async (contextBinnacle: any, locals: any) => {
                                return { extracted: locals };
                            }
                        },
                        extractorRecipes: {
                            0: {
                                type: FromLocals,
                                configuration: <any>{
                                    allLocals: true
                                }
                            }
                        }
                    }
                ]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            const result = JSON.parse(response.body);
            expect(result.extracted.user).toEqual('john');
            expect(result.extracted.role).toEqual('admin');
        });

        xit("Should extract specific named local", async () => {
            // ARRANGE
            const path = '/with-named-local';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [
                    {
                        // First middleware sets locals
                        activationContext: {
                            activate: async (contextBinnacle: any) => {
                                return new ToLocalsResponse({
                                    userId: '12345',
                                    sessionId: 'abc-def'
                                });
                            }
                        },
                        extractorRecipes: {}
                    },
                    {
                        // Second middleware extracts specific local
                        activationContext: {
                            activate: async (contextBinnacle: any, userId: string) => {
                                return { extractedUserId: userId };
                            }
                        },
                        extractorRecipes: {
                            0: {
                                type: FromLocals,
                                configuration: <any>{
                                    name: 'userId'
                                }
                            }
                        }
                    }
                ]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            const result = JSON.parse(response.body);
            expect(result.extractedUserId).toEqual('12345');
        });
    });

    describe("ExpressRequest Extractor", () => {
        it("Should provide access to complete Express request object", async () => {
            // ARRANGE
            const path = '/full-request';

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{ path: path }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async (contextBinnacle: any, req: any) => {
                            return {
                                hasMethod: req.method !== undefined,
                                hasPath: req.path !== undefined,
                                hasHeaders: req.headers !== undefined,
                                method: req.method,
                                path: req.path
                            };
                        }
                    },
                    extractorRecipes: {
                        0: {
                            type: ExpressRequest,
                            configuration: {}
                        }
                    }
                }]
            });

            await createAndStartApp();

            // ACT
            const response = await makeRequest('GET', path);

            // ASSERT
            const result = JSON.parse(response.body);
            expect(result.hasMethod).toBe(true);
            expect(result.hasPath).toBe(true);
            expect(result.hasHeaders).toBe(true);
            expect(result.method).toEqual('GET');
            expect(result.path).toEqual(path);
        });
    });
});
