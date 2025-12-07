import "reflect-metadata";
import "jasmine";
import { HttpModule } from "../../src";
import { testApp } from "./test-http-source"


const APP_PORT = 3000;

testApp("http", APP_PORT, () => {
    return HttpModule.builder()
            .withPort(APP_PORT)
            .build();
});
