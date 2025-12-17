import { FlexibleResponse } from "flexible-core";
import { HttpEvent } from "../../http-event";
import { HttpExtractor } from "../../extension-points/extractors/http-extractor";
import { HTTP_SOURCE_TYPES } from "../../http-source-types";
import { TypesHelper } from "../../helpers/types-helper";
import { inject, injectable } from "tsyringe";

/**
 * Extractor that retrieves HTTP request headers.
 *
 * Can extract all headers as an object or a specific named header value.
 * Header names are case-insensitive as per HTTP specification.
 *
 * @example
 * // Extract all headers
 * {
 *   type: FromHeaders,
 *   configuration: {
 *     allHeaders: true
 *   }
 * }
 *
 * @example
 * // Extract specific header (e.g., Authorization)
 * {
 *   type: FromHeaders,
 *   configuration: {
 *     name: 'authorization'
 *   }
 * }
 *
 * @example
 * // Extract custom header
 * {
 *   type: FromHeaders,
 *   configuration: {
 *     name: 'x-api-key'
 *   }
 * }
 */
@injectable()
export class FromHeaders extends HttpExtractor {

    /** When true, extracts all headers as an object; when false, extracts a specific named header */
    public allHeaders: boolean;

    constructor(@inject(HTTP_SOURCE_TYPES.HTTP_TYPES_HELPER) typesHelper: TypesHelper) {
        super(typesHelper)
    }

    public async extractValueFromHttpEvent(
        event: HttpEvent,
        response: FlexibleResponse,
        filterBinnacle: { [key: string]: string },
        contextBinnacle: { [key: string]: any }

        ): Promise<any> {
        return event.data.request &&
            event.data.request.headers &&
            (this.allHeaders ?
                event.data.request.headers :
                this.name && event.data.request.headers[this.name]);
    }

}