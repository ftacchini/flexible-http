import { Application } from "express";
import * as https from 'https';
import { HttpAbstractSource } from './http-abstract-source';
import { FlexibleLogger } from 'flexible-core';
import { ResponseProcessor } from './helpers/response-processor';
export declare class HttpsSource extends HttpAbstractSource {
    protected responseProcessor: ResponseProcessor;
    private credentials;
    constructor(responseProcessor: ResponseProcessor, logger: FlexibleLogger, port: number, credentials: https.ServerOptions, application?: Application);
    protected createServer(application: Application): https.Server;
    protected get httpServerType(): string;
}
