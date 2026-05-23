import type { Request, Response } from "express"
import { createUserInDB, loginUserInDB } from "./auth.service"
import { StatusCodes } from 'http-status-codes'
import { sendResponse } from "../../utils"
import type { IUser } from "../../types"

const signUp = async (req: Request, res: Response) => {
    const payload = req.body as IUser
    const result = await createUserInDB(payload)

    sendResponse(res, StatusCodes.CREATED, true, "User registered successfully", result)
}

const login = async (req: Request, res: Response) => {
    const { email, password }: { email: string, password: string } = req.body
    const result = await loginUserInDB(email, password)

    sendResponse(res, StatusCodes.OK, true, "Login successful", result)
}

export { signUp, login }