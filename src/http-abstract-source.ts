import * as express from 'express';
import * as http from 'http';
import * as https from 'https';
import { FlexibleEventSource, FlexibleResponse } from 'flexible-core';
import { HttpEvent } from './http-event';

export abstract class HttpAbstractSource implements FlexibleEventSource {
    
    protected server: https.Server | http.Server;
    private handler: (event: HttpEvent) => Promise<FlexibleResponse[]>;
    private initialized: boolean = false;

    protected constructor(
        protected port: number,
        private application: express.Application = express()) {
    }

    protected abstract createServer(application: express.Application): https.Server | http.Server;

    private initialize() {
        this.application.all("*", async (req, res, next) => {
            var httpEvent = new HttpEvent(req);
            var responseStack = await (this.handler && this.handler(httpEvent));
            
            if(responseStack && responseStack.length) {

            }

            next();
        })

        this.initialized = true;
    }

    public run(): Promise<any> {

        this.initialized || this.initialize();
        
        var promise = new Promise((resolve, reject) => {
            this.server = this.createServer(this.application);
            
            this.server.listen(this.port, (err: any, server: any) => {
                if(err) {
                    reject(err);
                } else {
                    resolve({})
                }
            });
        });

        return promise;
    }

    public stop(): Promise<any> {

        var promise = new Promise((resolve, reject) => {

            if(this.server){
                this.server.close((err: any) => {
                    if(err) { 
                        reject(err);
                    } else {
                        resolve({});
                    }
                });
            }
            else {
                resolve();
            }
        });

        return promise;
    }
    
    public onEvent(handler: (event: HttpEvent) => Promise<FlexibleResponse[]>): void {
        this.handler = handler;
    }

}