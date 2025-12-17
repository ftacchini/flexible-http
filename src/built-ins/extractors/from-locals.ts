import { HttpExtractor } from "../../extension-points/extractors/http-extractor";
import { inject, injectable } from "tsyringe";
import { HTTP_SOURCE_TYPES } from "../../http-source-types";
import { TypesHelper } from "../../helpers";
import { HttpEvent } from "../../http-event";
import { FlexibleResponse } from "flexible-core";

/**
 * Extractor that retrieves data from Express response.locals.
 *
 * Response.locals is an object used to pass data between middleware functions
 * during the request-response cycle. This extractor allows accessing that data
 * in your middleware activation functions.
 *
 * @example
 * // Extract all locals
 * {
 *   type: FromLocals,
 *   configuration: {
 *     allLocals: true
 *   }
 * }
 * // Returns entire locals object: { user: {...}, session: {...} }
 *
 * @example
 * // Extract specific local variable
 * {
 *   type: FromLocals,
 *   configuration: {
 *     name: 'userId'
 *   }
 * }
 * // Returns just the userId value from response.locals.userId
 *
 * @example
 * // Extract user data set by authentication middleware
 * {
 *   type: FromLocals,
 *   configuration: {
 *     name: 'user'
 *   }
 * }
 * // Returns the user object from response.locals.user
 */
@injectable()
export class FromLocals extends HttpExtractor {

    /** When true, extracts all locals as an object; when false, extracts a specific named local variable */
    public allLocals: boolean;

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
            return event.data.response &&
                event.data.response.locals &&
                (this.allLocals ?
                    event.data.response.locals :
                    this.name && event.data.response.locals[this.name]);

    }
}