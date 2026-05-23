import type { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { sendResponse, verifyToken } from "../utils";
import type { Roles } from "../types/roles";
import type { IJwtPayload } from "../types";
import jwt from "jsonwebtoken";

const auth = (...roles: Roles[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        const token = req.headers.authorization;
        if (!token) {
            return sendResponse(res, StatusCodes.UNAUTHORIZED, false, "Unauthorized access")
        }

        try {
            const decoded = verifyToken(token) as IJwtPayload

            const forbidden = !roles.includes(decoded.role)
            if (forbidden) {
                return sendResponse(res, StatusCodes.FORBIDDEN, false, "Forbidden access")
            }

            req.user = decoded;
            next()
        } catch (err: unknown) {
            if (err instanceof jwt.TokenExpiredError) {
                return sendResponse(res, StatusCodes.UNAUTHORIZED, false, "Token expired.");
            }

            if (err instanceof jwt.JsonWebTokenError) {
                return sendResponse(res, StatusCodes.UNAUTHORIZED, false, "Invalid token structure.");
            }

            return sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, false, "An unexpected error occurred during authentication."
            );
        }
    }
}

export default auth