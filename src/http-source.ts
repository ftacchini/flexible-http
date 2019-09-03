import * as express from 'express';
import * as http from 'http';
import { HttpAbstractSource } from './http-abstract-source';
import { injectable } from 'inversify';
import { FlexibleLogger } from 'flexible-core';
import { ResponseProcessor } from './helpers/response-processor';

const HTTP: string = "http";

@injectable()
export class HttpSource extends HttpAbstractSource {

    public constructor(
        protected responseProcessor: ResponseProcessor,
        logger: FlexibleLogger,
        port: number, 
        application: express.Application = null) {
        super(responseProcessor, logger, port, application);
    }

    protected createServer(application: express.Application): http.Server {
        return http.createServer(application);
    }

    protected get httpServerType(): string {
        return HTTP;
    }
}