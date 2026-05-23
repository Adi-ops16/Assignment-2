import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export class AppError extends Error {

    constructor(message: string, public code?: number) {
        super(message);

        // capturing the exact error line, which called the AppError class
        Error.captureStackTrace(this, this.constructor);
    }
}

export const globalErrorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    const isAppError = err instanceof AppError
    const statusCode = isAppError && typeof err.code === "number" ? err.code : StatusCodes.INTERNAL_SERVER_ERROR

    res.status(statusCode).json({
        success: false,
        message: err instanceof Error ? err.message : "Internal Server Error",
        errors: err instanceof Error ? err.stack : "Not Available"
    })
}

