import { HttpSourceModule } from "./http-source-module";

const DEFAULT_HTTP_PORT: number = 8080;
const DEFAULT_HTTPS_PORT: number = 8443;

export class HttpModuleBuilder {
    public withPort(port: number): this {
        return this;
    }

    public withCredentials(): this {
        return this;
    }

    public withApplication(): this {
        return this;
    }

    public build() {
        return new HttpSourceModule(
            this.withPort,
            this.application,
            this.credentials
        )
    }
}