import "reflect-metadata";
import "jasmine";
import { HttpModuleBuilder } from "../../src";
import { testApp } from "./test-http-source"


const APP_PORT = 3000;

testApp("http", APP_PORT, () => {
    return HttpModuleBuilder.instance
            .withPort(APP_PORT)
            .build();
});
