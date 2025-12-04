import "reflect-metadata";
import "jasmine";
import { DummyFramework, FlexibleApp, FlexibleFrameworkModule, FlexibleAppBuilder, SilentLoggerModule } from "flexible-core";
import { AsyncContainerModule } from "inversify";
import { HttpGet, HttpModule, HttpMethod } from "../../src";
import { JsonResponse } from "../../src/responses/json-response";
import * as http from 'http';
import * as https from 'https';

async function fetchJson(url: string): Promise<any> {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';

    return new Promise((resolve, reject) => {
        const client = isHttps ? https : http;
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            rejectUnauthorized: false // For self-signed certificates
        };

        const req = client.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (error) {
                    reject(new Error(`Failed to parse JSON: ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

export function testApp(protocol: string, port: number, moduleBuilder: () => HttpModule) {

    describe(`${protocol}App`, () => {

        let app: FlexibleApp;
        let framework: DummyFramework;

        beforeEach(async () => {
            framework = new DummyFramework();
        })

        it("Should run correctly", async () => {
            //ARRANGE
            let frameworkModule: FlexibleFrameworkModule = {
                getInstance: () => framework,
                container: new AsyncContainerModule(async () => { }),
                isolatedContainer: new AsyncContainerModule(async () => { })
            };

            let eventSource = moduleBuilder();

            app = FlexibleAppBuilder.instance
                .withLogger(new SilentLoggerModule())
                .addEventSource(eventSource)
                .addFramework(frameworkModule)
                .createApp();

            //ACT
            var result = await app.run();

            //ASSERT
            expect(result[0]).toEqual({ running: true })
        })

        it("Should stop correctly", async () => {
            //ARRANGE
            let frameworkModule: FlexibleFrameworkModule = {
                getInstance: () => framework,
                container: new AsyncContainerModule(async () => { }),
                isolatedContainer: new AsyncContainerModule(async () => { })
            };

            let eventSource = moduleBuilder();

            app = FlexibleAppBuilder.instance
                .withLogger(new SilentLoggerModule())
                .addEventSource(eventSource)
                .addFramework(frameworkModule)
                .createApp();

            //ACT
            await app.run();
            var result = await app.stop();

            //ASSERT
            expect(result[0]).toEqual({ running: false })
        })

        it("Should respond to operation with Json by default", async () => {
            //ARRANGE
            const path = `/GetItem`;
            const expected = {
                object: "response"
            }

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{
                        path: path
                    }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return expected;
                        }
                    },
                    extractorRecipes: {
                    }
                }]
            });

            let frameworkModule: FlexibleFrameworkModule = {
                getInstance: () => framework,
                container: new AsyncContainerModule(async () => { }),
                isolatedContainer: new AsyncContainerModule(async () => { })
            };

            let eventSource = moduleBuilder();

            app = FlexibleAppBuilder.instance
                .withLogger(new SilentLoggerModule())
                .addEventSource(eventSource)
                .addFramework(frameworkModule)
                .createApp();

            //ACT
            await app.run();
            await new Promise(resolve => setTimeout(resolve, 100)); // Give server time to fully initialize
            const result = await fetchJson(`${protocol}://localhost:${port}${path}`);

            //ASSERT
            expect(result).toEqual(expected);
        })

        it("Should respond to operation with provided response", async () => {
            //ARRANGE
            const path = `/GetItem`;
            const expected = {
                object: "response"
            }

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: <any>{
                        path: path
                    }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return new JsonResponse(expected);
                        }
                    },
                    extractorRecipes: {
                    }
                }]
            });

            let frameworkModule: FlexibleFrameworkModule = {
                getInstance: () => framework,
                container: new AsyncContainerModule(async () => { }),
                isolatedContainer: new AsyncContainerModule(async () => { })
            };

            let eventSource = moduleBuilder();

            app = FlexibleAppBuilder.instance
                .withLogger(new SilentLoggerModule())
                .addEventSource(eventSource)
                .addFramework(frameworkModule)
                .createApp();

            //ACT
            await app.run();
            await new Promise(resolve => setTimeout(resolve, 100)); // Give server time to fully initialize
            const result = await fetchJson(`${protocol}://localhost:${port}${path}`);

            //ASSERT
            expect(result).toEqual(expected);
        })

        it("Should respond to operation with composite path", async () => {
            //ARRANGE
            const path1 = `/GetItem1`
            const path2 = `/GetItem2`;
            const expected = {
                object: "response"
            }

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpMethod,
                    configuration: <any>{
                        path: path1
                    }
                }, {
                    type: HttpGet,
                    configuration: <any>{
                        path: path2
                    }
                }],
                middlewareStack: [{
                    activationContext: {
                        activate: async () => {
                            return expected;
                        }
                    },
                    extractorRecipes: {
                    }
                }]
            });

            let frameworkModule: FlexibleFrameworkModule = {
                getInstance: () => framework,
                container: new AsyncContainerModule(async () => { }),
                isolatedContainer: new AsyncContainerModule(async () => { })
            };

            let eventSource = moduleBuilder();

            app = FlexibleAppBuilder.instance
                .withLogger(new SilentLoggerModule())
                .addEventSource(eventSource)
                .addFramework(frameworkModule)
                .createApp();

            //ACT
            await app.run();
            await new Promise(resolve => setTimeout(resolve, 100)); // Give server time to fully initialize
            const result = await fetchJson(`${protocol}://localhost:${port}${path1}${path2}`);

            //ASSERT
            expect(result).toEqual(expected);
        })

        afterEach(async () => {
            if (app) {
                await app.stop();
                // Give the port time to be released
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        })
    })
}
