import { HttpMethod } from "./http-method";

export class HttpPost extends HttpMethod {
    
    constructor() {
        super();
        this.method = "post";
    }

}