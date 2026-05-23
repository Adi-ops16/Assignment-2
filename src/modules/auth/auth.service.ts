import { StatusCodes } from "http-status-codes";
import { pool } from "../../db"
import type { IJwtPayload, IResUser, IUser } from "../../types"
import { compareHashedPassword, hashPassword, signToken } from "../../utils";
import { AppError } from "../../middlewares/globalErrorHandler";
import type { QueryResult } from "pg";


const allowedRoles = ["maintainer", "contributor"];

const createUserInDB = async (payload: IUser): Promise<IResUser> => {
    const { name, email, password, role = "contributor" } = payload;
    const hashedPassword = await hashPassword(password)

    if (!allowedRoles.includes(role)) {
        throw new AppError("Invalid role type selected", StatusCodes.BAD_REQUEST);
    }

    const result: QueryResult<IResUser & { password: string }> = await pool.query(`INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING *`, [name, email, hashedPassword, role])
    const user = result.rows[0]

    if (!user) {
        throw new AppError("User registration failed. Please try again.", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    const { password: _, ...userWithoutPassword } = user

    return userWithoutPassword
}

const loginUserInDB = async (email: string, password: string) => {

    const result: QueryResult<IResUser & { password: string }> = await pool.query(`SELECT * FROM users WHERE email=$1`, [email])
    const user = result.rows[0]

    if (!user) {
        throw new AppError("Invalid Credentials", StatusCodes.BAD_REQUEST)
    }

    const isValidUser = await compareHashedPassword(password, user.password)
    if (!isValidUser) {
        throw new AppError("Invalid Credentials", StatusCodes.UNAUTHORIZED)
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    } as IJwtPayload
    const accessToken = signToken(jwtPayload)

    const { password: _, ...userWithoutPassword } = user
    const responseData = {
        token: accessToken,
        user: userWithoutPassword
    }

    return responseData
}

export { loginUserInDB, createUserInDB }