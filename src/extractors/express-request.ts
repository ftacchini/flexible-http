import { FlexibleExtractor, RouteData, FlexibleResponse } from "flexible-core";
import { HttpEventProperties } from "../http-event-properties";
import { HttpEvent } from "../http-event";

/**
 * Extractor that provides access to the complete Express Request object.
 *
 * This extractor gives you full access to the underlying Express request object,
 * allowing you to access any request properties, methods, or custom properties
 * that may have been added by other middleware.
 *
 * @example
 * // Access the full request object
 * {
 *   type: ExpressRequest,
 *   configuration: {}
 * }
 * // Returns the complete Express Request object with all properties:
 * // - req.method, req.path, req.url
 * // - req.headers, req.body, req.query, req.params
 * // - req.cookies, req.session (if middleware is configured)
 * // - req.ip, req.hostname, req.protocol
 * // - And any custom properties added by middleware
 *
 * @example
 * // Use in middleware to access request details
 * activationContext: {
 *   activate: async (contextBinnacle: any, req: Request) => {
 *     console.log(`${req.method} ${req.path}`);
 *     console.log(`User-Agent: ${req.headers['user-agent']}`);
 *     return { success: true };
 *   }
 * },
 * extractorRecipes: {
 *   0: { type: ExpressRequest, configuration: {} }
 * }
 */
export class ExpressRequest implements FlexibleExtractor {

    public get staticRouting(): Partial<RouteData<HttpEventProperties>> {
        return {
            eventType: HttpEvent.EventType
        };
    };

    public async extractValue(
        event: HttpEvent,
        response: FlexibleResponse,
        filterBinnacle: { [key: string]: string },
        contextBinnacle: { [key: string]: any }
    ): Promise<any> {
        return event.data.request;
    }

}