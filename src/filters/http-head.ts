import { HttpMethod } from "./http-method";

export class HttpHead extends HttpMethod {
    
    constructor() {
        super();
        this.method = "head";
    }

}