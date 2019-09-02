import * as express from 'express';
import * as https from 'https';

import { HttpAbstractSource } from './http-abstract-source';
import { injectable } from 'inversify';
import { FlexibleLogger } from 'flexible-core';

const HTTPS: string = "https";

@injectable()
export class HttpsSource extends HttpAbstractSource {

    public constructor(
        logger: FlexibleLogger,
        port: number, 
        private credentials: https.ServerOptions, 
        application: express.Application = null) {
        super(logger, port, application);
    }

    protected createServer(application: express.Application): https.Server {
        return https.createServer(this.credentials, application);
    }

    protected get httpServerType(): string {
        return HTTPS;
    }
}