import express from 'express';
import * as http from 'http';
import * as https from 'https';
import { FlexibleEventSource, FlexibleResponse, FlexibleLogger } from 'flexible-core';
import { HttpEvent } from './http-event';
import { injectable } from 'tsyringe';
import { ResponseProcessor } from './helpers/response-processor';

export abstract class HttpAbstractSource implements FlexibleEventSource {

    protected server: https.Server | http.Server;
    private handler: (event: HttpEvent) => Promise<FlexibleResponse[]>;
    private initialized: boolean = false;

    constructor(
        protected responseProcessor: ResponseProcessor,
        protected logger: FlexibleLogger,
        protected port: number,
        private application: express.Application = express()) {
    }

    protected abstract createServer(application: express.Application): https.Server | http.Server;

    private initialize() {
        this.application.all("*", async (req, res, next) => {
            // Use X-Request-ID header if present, otherwise generate one
            const requestId = req.headers['x-request-id'] as string ||
                             `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

            // Log request details (safe metadata only, no body/query params)
            this.logger.debug("HTTP request received", {
                requestId,
                method: req.method,
                path: req.path,
                clientIp: req.ip || 'unknown'
            });

            var httpEvent = new HttpEvent(req, res, requestId);
            try {
                const startTime = Date.now();
                this.logger.debug("Calling handler", { requestId });
                var responses = await (this.handler && this.handler(httpEvent));
                const duration = Date.now() - startTime;

                this.logger.debug("Handler completed", {
                    requestId,
                    duration,
                    responseCount: responses?.length || 0
                });

                this.logger.debug("About to call responseProcessor.writeToResponse", { requestId });
                await this.responseProcessor.writeToResponse(responses, res, next);

                this.logger.debug("Response sent", {
                    requestId,
                    statusCode: res.statusCode
                });

                this.logger.debug("Request handling completed successfully", { requestId });
            }
            catch(err) {
                this.logger.debug("Request failed", {
                    requestId,
                    error: err instanceof Error ? err.message : 'Unknown error',
                    stack: err instanceof Error ? err.stack : undefined
                });
                next(err);
            }
        })

        this.initialized = true;
    }

    public run(): Promise<any> {

        this.initialized || this.initialize();

        var promise = new Promise(async (resolve, reject) => {

            this.server = this.createServer(this.application);

            this.server.listen(this.port, '0.0.0.0', () => {
                resolve({
                    running: true
                })
            });

            this.server.on('error', (err: any) => {
                reject({
                    running: false,
                    error: err
                });
            });
        });

        return promise;
    }

    public stop(): Promise<any> {

        var promise = new Promise((resolve, reject) => {

            if(this.server){

                this.server.close((err: any) => {
                    if(err) {
                        reject({
                            running: false,
                            error: err
                        });
                    } else {
                        this.server = null;

                        resolve({
                            running: false
                        });
                    }
                });
            }
            else {
                resolve(undefined);
            }
        });

        return promise;
    }

    public onEvent(handler: (event: HttpEvent) => Promise<FlexibleResponse[]>): void {
        this.handler = handler;
    }

}