import type { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { sendResponse, verifyToken } from "../utils";
import type { Roles } from "../types/roles";
import type { IJwtPayload } from "../types";

const auth = (...roles: Roles[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        const token = req.headers.authorization;
        if (!token) {
            return sendResponse(res, StatusCodes.UNAUTHORIZED, false, "Unauthorized access")
        }

        const decoded = verifyToken(token) as IJwtPayload
        if (!decoded) {
            return sendResponse(res, StatusCodes.UNAUTHORIZED, false, "Unauthorized access")
        }

        const forbidden = !roles.includes(decoded.role)
        if (forbidden) {
            return sendResponse(res, StatusCodes.FORBIDDEN, false, "Forbidden access")
        }

        req.user = decoded;
        next()
    }
}

export default auth