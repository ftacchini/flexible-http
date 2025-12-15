import { Application } from "express";
import * as http from 'http';
import { HttpAbstractSource, HttpSourceConfig } from './http-abstract-source';
import { FlexibleLogger } from 'flexible-core';
import { ResponseProcessor } from './helpers/response-processor';
export declare class HttpSource extends HttpAbstractSource {
    protected responseProcessor: ResponseProcessor;
    constructor(responseProcessor: ResponseProcessor, logger: FlexibleLogger, port: number, application?: Application, config?: HttpSourceConfig);
    protected createServer(application: Application): http.Server;
    protected get httpServerType(): string;
}
