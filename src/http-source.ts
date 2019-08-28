import * as express from 'express';
import * as http from 'http';
import { HttpAbstractSource } from './http-abstract-source';

const HTTP: string = "http";

export class HttpSource extends HttpAbstractSource {

    public constructor(
        port: number, 
        application: express.Application = null) {
        super(port, application);
    }

    protected createServer(application: express.Application): http.Server {
        return http.createServer(application);
    }

    protected get httpServerType(): string {
        return HTTP;
    }
}