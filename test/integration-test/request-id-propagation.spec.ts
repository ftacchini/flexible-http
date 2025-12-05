import "reflect-metadata";
import "jasmine";
import { DummyFramework, FlexibleApp, FlexibleFrameworkModule, FlexibleAppBuilder, FlexibleLogger } from "flexible-core";
import { ContainerModule } from "inversify";
import { HttpGet, HttpModuleBuilder } from "../../src";
import * as http from 'http';

class CaptureLogger implements FlexibleLogger {
    public logs: string[] = [];

    private logWithContext(message: string, context?: any): void {
        const contextStr = context ? ` ${JSON.stringify(context)}` : '';
        this.logs.push(message + contextStr);
    }

    debug(message: string, context?: any): void {
        this.logWithContext(message, context);
    }

    info(message: string, context?: any): void {
        this.logWithContext(message, context);
    }

    notice(message: string, context?: any): void {
        this.logWithContext(message, context);
    }

    warning(message: string, context?: any): void {
        this.logWithContext(message, context);
    }

    error(message: string, context?: any): void {
        this.logWithContext(message, context);
    }

    crit(message: string, context?: any): void {
        this.logWithContext(message, context);
    }

    alert(message: string, context?: any): void {
        this.logWithContext(message, context);
    }

    emergency(message: string, context?: any): void {
        this.logWithContext(message, context);
    }

    clear(): void {
        this.logs = [];
    }
}

async function makeRequest(url: string, requestId?: string): Promise<any> {
    const urlObj = new URL(url);

    return new Promise((resolve, reject) => {
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: requestId ? { 'X-Request-ID': requestId } : {}
        };

        const req = http.request(options, (res) => {
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

describe("X-Request-ID Propagation", () => {
    const APP_PORT = 3001;
    let app: FlexibleApp;
    let framework: DummyFramework;
    let captureLogger: CaptureLogger;

    beforeEach(async () => {
        framework = new DummyFramework();
        captureLogger = new CaptureLogger();
    });

    it("Should propagate X-Request-ID header through entire request lifecycle", async () => {
        const path = `/test`;
        const customRequestId = "my-custom-request-id-12345";
        const expected = { result: "success" };

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
                extractorRecipes: {}
            }]
        });

        let frameworkModule: FlexibleFrameworkModule = {
            getInstance: () => framework,
            container: new ContainerModule(() => { }),
            isolatedContainer: new ContainerModule(() => { })
        };

        let eventSource = HttpModuleBuilder.instance
            .withPort(APP_PORT)
            .build();

        let loggerModule = {
            getInstance: () => captureLogger,
            container: new ContainerModule(() => { })
        };

        app = FlexibleAppBuilder.instance
            .withLogger(loggerModule)
            .addEventSource(eventSource)
            .addFramework(frameworkModule)
            .createApp();

        await app.run();
        await new Promise(resolve => setTimeout(resolve, 100));

        captureLogger.clear();

        const result = await makeRequest(`http://localhost:${APP_PORT}${path}`, customRequestId);

        // Wait a bit for logs to be written
        await new Promise(resolve => setTimeout(resolve, 50));

        expect(result).toEqual(expected);

        const requestLogs = captureLogger.logs.filter(log => log.includes(customRequestId));

        expect(requestLogs.length).toBeGreaterThan(0);

        const httpLog = requestLogs.find(log => log.includes('HTTP request received'));
        expect(httpLog).toBeDefined();
        expect(httpLog).toContain(customRequestId);
        expect(httpLog).toContain('"method":"GET"');
        expect(httpLog).toContain('"/test"');

        const appReceivedLog = requestLogs.find(log => log.includes('Request received'));
        expect(appReceivedLog).toBeDefined();
        expect(appReceivedLog).toContain(customRequestId);

        const routingLog = requestLogs.find(log => log.includes('Routing request'));
        expect(routingLog).toBeDefined();
        expect(routingLog).toContain(customRequestId);

        const completedLog = requestLogs.find(log => log.includes('Request completed'));
        expect(completedLog).toBeDefined();
        expect(completedLog).toContain(customRequestId);

        // Verify all logs with this request ID are isolated
        const allRequestIdLogs = captureLogger.logs.filter(log => log.includes('"requestId"'));
        const nonCustomIdLogs = allRequestIdLogs.filter(log => !log.includes(customRequestId));

        expect(nonCustomIdLogs.length).toBe(0);
    });

    it("Should generate request ID when X-Request-ID header is not provided", async () => {
        const path = `/test`;
        const expected = { result: "success" };

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
                extractorRecipes: {}
            }]
        });

        let frameworkModule: FlexibleFrameworkModule = {
            getInstance: () => framework,
            container: new ContainerModule(() => { }),
            isolatedContainer: new ContainerModule(() => { })
        };

        let eventSource = HttpModuleBuilder.instance
            .withPort(APP_PORT)
            .build();

        let loggerModule = {
            getInstance: () => captureLogger,
            container: new ContainerModule(() => { })
        };

        app = FlexibleAppBuilder.instance
            .withLogger(loggerModule)
            .addEventSource(eventSource)
            .addFramework(frameworkModule)
            .createApp();

        await app.run();
        await new Promise(resolve => setTimeout(resolve, 100));

        captureLogger.clear();

        const result = await makeRequest(`http://localhost:${APP_PORT}${path}`);

        // Wait a bit for logs to be written
        await new Promise(resolve => setTimeout(resolve, 50));

        expect(result).toEqual(expected);

        const httpLog = captureLogger.logs.find(log => log.includes('HTTP request received'));
        expect(httpLog).toBeDefined();

        // Extract requestId from JSON context
        const requestIdMatch = httpLog!.match(/"requestId":"([^"]+)"/);
        expect(requestIdMatch).toBeDefined();

        const generatedRequestId = requestIdMatch![1];

        // Verify it matches the generated format (timestamp-random)
        expect(generatedRequestId).toMatch(/^\d+-[a-z0-9]+$/);

        const requestLogs = captureLogger.logs.filter(log => log.includes(generatedRequestId));
        expect(requestLogs.length).toBeGreaterThan(0);

        const appReceivedLog = requestLogs.find(log => log.includes('Request received'));
        expect(appReceivedLog).toBeDefined();
        expect(appReceivedLog).toContain(generatedRequestId);
    });

    it("Should use different request IDs for concurrent requests", async () => {
        const path = `/test`;
        const requestId1 = "request-1";
        const requestId2 = "request-2";
        const expected = { result: "success" };

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
                        await new Promise(resolve => setTimeout(resolve, 50));
                        return expected;
                    }
                },
                extractorRecipes: {}
            }]
        });

        let frameworkModule: FlexibleFrameworkModule = {
            getInstance: () => framework,
            container: new ContainerModule(() => { }),
            isolatedContainer: new ContainerModule(() => { })
        };

        let eventSource = HttpModuleBuilder.instance
            .withPort(APP_PORT)
            .build();

        let loggerModule = {
            getInstance: () => captureLogger,
            container: new ContainerModule(() => { })
        };

        app = FlexibleAppBuilder.instance
            .withLogger(loggerModule)
            .addEventSource(eventSource)
            .addFramework(frameworkModule)
            .createApp();

        await app.run();
        await new Promise(resolve => setTimeout(resolve, 100));

        captureLogger.clear();

        const [result1, result2] = await Promise.all([
            makeRequest(`http://localhost:${APP_PORT}${path}`, requestId1),
            makeRequest(`http://localhost:${APP_PORT}${path}`, requestId2)
        ]);

        // Wait a bit for logs to be written
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(result1).toEqual(expected);
        expect(result2).toEqual(expected);

        const request1Logs = captureLogger.logs.filter(log => log.includes(requestId1));
        const request2Logs = captureLogger.logs.filter(log => log.includes(requestId2));

        expect(request1Logs.length).toBeGreaterThan(0);
        expect(request2Logs.length).toBeGreaterThan(0);

        request1Logs.forEach(log => {
            expect(log).not.toContain(requestId2);
        });

        request2Logs.forEach(log => {
            expect(log).not.toContain(requestId1);
        });
    });

    afterEach(async () => {
        if (app) {
            await app.stop();
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    });
});
