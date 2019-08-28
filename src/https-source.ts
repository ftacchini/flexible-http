import * as express from 'express';
import * as https from 'https';

import { HttpAbstractSource } from './http-abstract-source';

const HTTPS: string = "https";

export class HttpsSource extends HttpAbstractSource {

    public constructor(
        port: number, 
        private credentials: https.ServerOptions, 
        application: express.Application = null) {
        super(port, application);
    }

    protected createServer(application: express.Application): https.Server {
        return https.createServer(this.credentials, application);
    }

    protected get httpServerType(): string {
        return HTTPS;
    }
}