import "reflect-metadata";
import "jasmine";
import { DummyFramework } from "flexible-dummy-framework";
import { FlexibleApp, FlexibleFrameworkModule, FlexibleAppBuilder } from "flexible-core";
import { AsyncContainerModule } from "inversify";
import { HttpModuleBuilder, HttpGet } from "../../src";
import * as request from "request";
import { JsonResponse } from "../../src/responses/json-response";

const APP_PORT = 8080;

describe("HttpApp", () => {

    let app: FlexibleApp;
    let framework: DummyFramework;

    beforeEach(() => {
        framework = new DummyFramework();

        let frameworkModule: FlexibleFrameworkModule = {
            getInstance: () => framework,
            container: new AsyncContainerModule(async () => { }),
            isolatedContainer: new AsyncContainerModule(async () => { })
        };

        let eventSource = HttpModuleBuilder.instance
            .withPort(APP_PORT)
            .build();

        app = FlexibleAppBuilder.instance
            .addEventSource(eventSource)
            .addFramework(frameworkModule)
            .createApp();
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
            request.get(`http://localhost:${APP_PORT}${path}`, {
                json: true
            }, (err, res, body) => {
                if(err){
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
            request.get(`http://localhost:${APP_PORT}${path}`, {
                json: true
            }, (err, res, body) => {
                if(err){
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