import { HttpExtractor } from "../../extension-points/extractors/http-extractor";
import { injectable, inject } from "tsyringe";
import { HTTP_SOURCE_TYPES } from "../../http-source-types";
import { TypesHelper } from "../../helpers/types-helper";
import { HttpEvent } from "../../http-event";
import { FlexibleResponse } from "flexible-core";

/**
 * Extractor that retrieves query string parameters from the URL.
 *
 * Extracts parameters from the URL query string (everything after the ? in the URL).
 * Query parameters are automatically parsed by Express.
 *
 * @example
 * // Extract all query parameters
 * {
 *   type: FromQuery,
 *   configuration: {
 *     allQuery: true
 *   }
 * }
 * // For request to /search?q=test&limit=10, returns: { q: 'test', limit: '10' }
 *
 * @example
 * // Extract specific query parameter
 * {
 *   type: FromQuery,
 *   configuration: {
 *     name: 'q'
 *   }
 * }
 * // For request to /search?q=typescript&page=1, returns: 'typescript'
 *
 * @example
 * // Extract pagination parameter
 * {
 *   type: FromQuery,
 *   configuration: {
 *     name: 'page'
 *   }
 * }
 * // For request to /items?page=2&limit=20, returns: '2'
 */
@injectable()
export class FromQuery extends HttpExtractor {

    /** When true, extracts all query parameters as an object; when false, extracts a specific named parameter */
    public allQuery: boolean;

    constructor(
        @inject(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER) typesHelper: TypesHelper) {
        super(typesHelper)
    }

    public async extractValueFromHttpEvent(
        event: HttpEvent,
        response: FlexibleResponse,
        filterBinnacle: { [key: string]: string },
        contextBinnacle: { [key: string]: any }

        ): Promise<any> {
            return event.data.request &&
                event.data.request.query &&
                (this.allQuery ?
                    event.data.request.query :
                    this.name && event.data.request.query[this.name]);

    }
}