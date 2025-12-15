import express from 'express';
import * as http from 'http';
import * as https from 'https';
import { FlexibleEventSource, FlexibleResponse, FlexibleLogger } from 'flexible-core';
import { HttpEvent } from './http-event';
import { ResponseProcessor } from './helpers/response-processor';
export interface HttpSourceConfig {
    enableCancellation?: boolean;
}
export declare abstract class HttpAbstractSource implements FlexibleEventSource {
    protected responseProcessor: ResponseProcessor;
    protected logger: FlexibleLogger;
    protected port: number;
    private application;
    protected server: https.Server | http.Server;
    private handler;
    private initialized;
    private config;
    constructor(responseProcessor: ResponseProcessor, logger: FlexibleLogger, port: number, application?: express.Application, config?: HttpSourceConfig);
    protected abstract createServer(application: express.Application): https.Server | http.Server;
    private initialize;
    run(): Promise<any>;
    stop(): Promise<any>;
    onEvent(handler: (event: HttpEvent) => Promise<FlexibleResponse[]>): void;
}
