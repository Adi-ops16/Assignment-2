import bcrypt from 'bcrypt'
import type { Response } from 'express'
import type { IJwtPayload } from '../types'
import jwt, { type SignOptions } from 'jsonwebtoken'
import config from '../config'
import { AppError } from '../middlewares/globalErrorHandler'
import { StatusCodes } from 'http-status-codes'
import type { IIssueQueryFilters } from '../modules/issue/issues.types'

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10)
}

export const compareHashedPassword = async (inputPassword: string, hashedPassword: string) => {
    return await bcrypt.compare(inputPassword, hashedPassword)
}

export const sendResponse = <T>(
    res: Response,
    code: number,
    success: boolean,
    message?: string,
    data?: T,
) => {
    return res.status(code).json({
        success,
        ...(message && { message }),
        ...(data && { data }),
    })

}

export const signToken = (jwtPayload: IJwtPayload) => {
    const accessToken = jwt.sign(
        jwtPayload,
        config.jwtSecret,
        { expiresIn: config.tokenTime } as SignOptions
    )

    return accessToken
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, config.jwtSecret)
}

export const checkQueryParams = (params: IIssueQueryFilters) => {
    const allowedSort = ["newest", "oldest"];
    const allowedTypes = ["bug", "feature_request"];
    const allowedStatus = ["open", "in_progress", "resolved"];

    const sort = (params.sort) || "newest";
    const type = params.type;
    const status = params.status;

    if (
        (!allowedSort.includes(sort)) ||
        (type && !allowedTypes.includes(type)) ||
        (status && !allowedStatus.includes(status))
    ) {
        throw new AppError("Invalid query params, check your query parameters", StatusCodes.BAD_REQUEST)
    }

    return {
        sort,
        type,
        status
    }
}