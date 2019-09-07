import "reflect-metadata";
import "jasmine";
import { DummyFramework } from "flexible-dummy-framework";
import { FlexibleApp, FlexibleFrameworkModule, FlexibleAppBuilder } from "flexible-core";
import { AsyncContainerModule } from "inversify";
import { HttpGet, HttpModule, HttpMethod } from "../../src";
import * as request from "request";
import { JsonResponse } from "../../src/responses/json-response";

export function testApp(protocol: string, port: number, moduleBuilder: () => HttpModule) {

    describe(`${protocol}App`, () => {

        let app: FlexibleApp;
        let framework: DummyFramework;

        beforeEach(async (done) => {
            framework = new DummyFramework();

            let frameworkModule: FlexibleFrameworkModule = {
                getInstance: () => framework,
                container: new AsyncContainerModule(async () => { }),
                isolatedContainer: new AsyncContainerModule(async () => { })
            };

            let eventSource = await moduleBuilder();

            app = FlexibleAppBuilder.instance
                .addEventSource(eventSource)
                .addFramework(frameworkModule)
                .createApp();

            done();
        })

        it("Should run correctly", async (done) => {
            //ARRANGE
            //ACT
            var result = await app.run();

            //ASSERT
            expect(result[0]).toEqual({ running: true })
            done();
        })

        it("Should stop correctly", async (done) => {
            //ARRANGE
            //ACT
            await app.run();
            var result = await app.stop();

            //ASSERT
            expect(result[0]).toEqual({ running: false })
            done();
        })

        it("Should respond to operation with Json by default", async (done) => {
            //ARRANGE
            const path = `/GetItem`;
            const expected = {
                object: "response"
            }

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: {
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


            //ACT
            await app.run();


            var result: any = await new Promise((fulfill, reject) => {
                request.get(`${protocol}://localhost:${port}${path}`, {
                    json: true,
                    rejectUnauthorized: false
                }, (err, res, body) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        fulfill(body)
                    }
                })
            });

            //ASSERT
            expect(result).toEqual(expected);
            done();
        })

        it("Should respond to operation with provided response", async (done) => {
            //ARRANGE
            const path = `/GetItem`;
            const expected = {
                object: "response"
            }

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpGet,
                    configuration: {
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

            //ACT
            await app.run();


            var result: any = await new Promise((fulfill, reject) => {
                request.get(`${protocol}://localhost:${port}${path}`, {
                    json: true,
                    rejectUnauthorized: false
                }, (err, res, body) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        fulfill(body)
                    }
                })
            });

            //ASSERT
            expect(result).toEqual(expected);
            done();
        })

        it("Should respond to operation with composite path", async (done) => {
            //ARRANGE
            const path1 = `/GetItem1`
            const path2 = `/GetItem2`;
            const expected = {
                object: "response"
            }

            framework.addPipelineDefinition({
                filterStack: [{
                    type: HttpMethod,
                    configuration: {
                        path: path1
                    }
                }, {
                    type: HttpGet,
                    configuration: {
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


            //ACT
            await app.run();


            var result: any = await new Promise((fulfill, reject) => {
                request.get(`${protocol}://localhost:${port}${path1}${path2}`, {
                    json: true,
                    rejectUnauthorized: false
                }, (err, res, body) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        fulfill(body)
                    }
                })
            });

            //ASSERT
            expect(result).toEqual(expected);
            done();
        })

        afterEach(async (done) => {
            await app.stop();
            done();
        })
    })
}
