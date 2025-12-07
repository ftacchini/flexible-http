import "reflect-metadata";
import "jasmine";
import { HttpModule } from "../../src";
export declare function testApp(protocol: string, port: number, moduleBuilder: () => HttpModule): void;
