import { HttpExtractor } from "./http-extractor";
import { HTTP_SOURCE_TYPES } from "../http-source-types";
import { inject, injectable } from "tsyringe";
import { TypesHelper } from "../helpers/types-helper";
import { HttpEvent } from "../http-event";
import { FlexibleResponse } from "flexible-core";
import { Key } from "path-to-regexp";
import { RouteProcessor } from "../helpers/route-processor";

// Replacement for deprecated util.isNullOrUndefined
function isNullOrUndefined(value: any): boolean {
    return value === null || value === undefined;
}

/**
 * Extractor that retrieves path parameters from the URL route.
 *
 * Extracts dynamic segments from the URL path that match route patterns.
 * Uses path-to-regexp for pattern matching and parameter extraction.
 *
 * @example
 * // Extract all path parameters from route /users/:userId/posts/:postId
 * {
 *   type: FromPath,
 *   configuration: {
 *     allPath: true
 *   }
 * }
 * // For request to /users/123/posts/456, returns: { userId: '123', postId: '456' }
 *
 * @example
 * // Extract specific path parameter
 * {
 *   type: FromPath,
 *   configuration: {
 *     name: 'userId'
 *   }
 * }
 * // For request to /users/123/profile, returns: '123'
 *
 * @example
 * // Extract from nested routes
 * {
 *   type: FromPath,
 *   configuration: {
 *     name: 'id'
 *   }
 * }
 * // For route /api/v1/items/:id, extracts the id parameter
 */
@injectable()
export class FromPath extends HttpExtractor{

    /** When true, extracts all path parameters as an object; when false, extracts a specific named parameter */
    public allPath: boolean;

    constructor(
        @inject(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER) typesHelper: TypesHelper,
        @inject(HTTP_SOURCE_TYPES.HTTP_ROUTE_PROCESSOR) private routeProcessor: RouteProcessor) {
        super(typesHelper)
    }

    public async extractValueFromHttpEvent(
        event: HttpEvent,
        response: FlexibleResponse,
        filterBinnacle: {
            [key: string]: string;
        }): Promise<any> {

            let keys: Key[] = [];
            const regex = this.routeProcessor.pathToRegexp(filterBinnacle.path, keys);

            let resultingKeys = regex.exec(event.data.request.path);

            if(isNullOrUndefined(resultingKeys)) {
                return resultingKeys;
            }

            if(this.allPath) {
                let pathObject: { [index:string]: string } = {};

                keys.forEach((key, index) => {
                    this.isKey(key) && (pathObject[key.name] = resultingKeys[index + 1])
                });

                return pathObject;
            }
            else if (this.name){
                let key = keys.find(key => this.isKey(key) && key.name == this.name);
                return key && resultingKeys[keys.indexOf(key) + 1];
            }

            return null;
    }

    private isKey(key: string | Key): key is Key {
        return (key as Key).name !== undefined;
    }
}