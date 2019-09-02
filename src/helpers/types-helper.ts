import { injectable } from "inversify";
import { merge } from "lodash";

@injectable()
export class TypesHelper {
    public castToType(value: any, type: any): any {
        switch(type) {
            case String:
            case Number:
            case Boolean:
                return type(value);
            case Object:
            case Function:
            case null:
            case undefined:
                return value;
            default:
                var instance = new type();
                merge(instance, value);
                return instance;
        }
    }
}