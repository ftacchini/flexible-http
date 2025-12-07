import { Application } from "express";
import * as http from 'http';
import { HttpAbstractSource } from './http-abstract-source';
import { FlexibleLogger } from 'flexible-core';
import { ResponseProcessor } from './helpers/response-processor';
export declare class HttpSource extends HttpAbstractSource {
    protected responseProcessor: ResponseProcessor;
    constructor(responseProcessor: ResponseProcessor, logger: FlexibleLogger, port: number, application?: Application);
    protected createServer(application: Application): http.Server;
    protected get httpServerType(): string;
}
