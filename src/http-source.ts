import { Application } from "express";
import * as http from 'http';
import { HttpAbstractSource, HttpSourceConfig } from './http-abstract-source';
import { injectable } from 'tsyringe';
import { FlexibleLogger } from 'flexible-core';
import { ResponseProcessor } from './helpers/response-processor';

const HTTP: string = "http";

@injectable()
export class HttpSource extends HttpAbstractSource {

    public constructor(
        protected responseProcessor: ResponseProcessor,
        logger: FlexibleLogger,
        port: number,
        application: Application = null,
        config?: HttpSourceConfig) {
        super(responseProcessor, logger, port, application, config);
    }

    protected createServer(application: Application): http.Server {
        return http.createServer(application);
    }

    protected get httpServerType(): string {
        return HTTP;
    }
}