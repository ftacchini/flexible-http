import { HttpResponse } from "./http-response";
import { NextFunction, Response } from "express";

export class JsonErrorResponse implements HttpResponse {

    constructor(private statusCode: number, private message?: string) {}

    public async writeToHttpResponse(response: Response, next: NextFunction): Promise<void> {
        response.status(this.statusCode).json({
            error: true,
            statusCode: this.statusCode,
            message: this.message || this.getDefaultMessage(this.statusCode)
        });
        next();
    }

    private getDefaultMessage(statusCode: number): string {
        const messages: Record<number, string> = {
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            500: "Internal Server Error",
            502: "Bad Gateway",
            503: "Service Unavailable"
        };
        return messages[statusCode] || "Error";
    }
}
