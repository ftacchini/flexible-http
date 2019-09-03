import "reflect-metadata";
import "jasmine";
import * as http from "http";
import { DummyFramework } from "flexible-dummy-framework";
import { FlexibleApp, FlexibleFrameworkModule, FlexibleAppBuilder } from "flexible-core";
import { AsyncContainerModule } from "inversify";
import { HttpModuleBuilder, HttpGet } from "../../src";

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

    it("Should respond to operation", async (done) => {
        //ARRANGE
        var options = {
            host: 'localhost',
            path: `/GetItem`,
            port: APP_PORT,
            method: "get"
        }

        framework.addPipelineDefinition({
            filterStack: [{
                type: HttpGet,
                configuration: {
                    path: options.path
                }
            }],
            middlewareStack: [{
                activationContext: {
                    activate: async () => {
                        return true;
                    }
                },
                extractorRecipes: {
                }
            }]
        });


        //ACT
        await app.run();

        var result = await new Promise((fulfill, reject) => {
            http.request(options)
                .on('response', fulfill)
                .end();
        });

        //ASSERT
        expect(result).toEqual(true);
        done();
    })


    it("asd run correctly", () => {
    })

    afterEach(async (done) => {
        await app.stop();
        done();
    })
})