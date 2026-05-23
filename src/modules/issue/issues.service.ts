import { StatusCodes } from "http-status-codes";
import { pool } from "../../db";
import { AppError } from "../../middlewares/globalErrorHandler";
import type { IIssue, IIssuePayload, IIssueQueryFilters, IReporter, ISingleIssueResponse } from "./issues.types";
import type { QueryResult } from "pg";


const postIssueInDB = async (issuePayload: IIssuePayload, reporter_id: number): Promise<IIssue> => {
    const { title, type, description } = issuePayload

    const allowedTypes = ["bug", "feature_request"];
    if (!type || !allowedTypes.includes(type)) {
        throw new AppError("Invalid issue type selected", StatusCodes.BAD_REQUEST);
    }

    if (!description || description.trim().length < 20) {
        throw new AppError("Description is too short. Please provide more details.", StatusCodes.BAD_REQUEST);
    }

    const result: QueryResult<IIssue> = await pool.query<IIssue>(`INSERT INTO issues(title,type,description,reporter_id) VALUES($1,$2,$3,$4) RETURNING *`, [title, type, description, reporter_id])

    return result.rows[0]!
}

const getAllIssuesFromDB = async (filters: IIssueQueryFilters): Promise<ISingleIssueResponse[]> => {
    const { type, sort, status } = filters

    let queryText = `SELECT * FROM issues WHERE 1=1`
    const queryValues: string[] = []

    if (status) {
        queryValues.push(status)
        queryText += ` AND status=$${queryValues.length}`
    }
    if (type) {
        queryValues.push(type)
        queryText += ` AND type=$${queryValues.length}`
    }
    if (sort === "oldest") {
        queryText += ` ORDER BY created_at ASC`
    } else {
        queryText += ` ORDER BY created_at DESC`
    }

    const { rows: issues }: QueryResult<IIssue> = await pool.query<IIssue>(queryText, queryValues)

    if (issues.length === 0) {
        return []
    }

    const reporterIds: number[] = Array.from(new Set(issues.map(issue => issue.reporter_id)))

    const { rows: users }: QueryResult<IReporter> = await pool.query<IReporter>(`SELECT id,name,role FROM users WHERE id = ANY($1)`, [reporterIds])

    if (users.length === 0) {
        throw new AppError("Couldn't find user", StatusCodes.NOT_FOUND)
    }

    const finalData = issues.map((issue: IIssue) => {
        const { reporter_id, ...restOfIssue } = issue

        const user: IReporter = users.find(user => user.id === reporter_id)!

        return {
            ...restOfIssue,
            reporter: user
        }
    })

    return finalData

}

const getSingleIssueFromDB = async (id: number): Promise<ISingleIssueResponse> => {

    const issueData: QueryResult<IIssue> = await pool.query<IIssue>(`SELECT * FROM issues WHERE id = $1`, [id])

    if (issueData.rows.length === 0) {
        throw new AppError("Couldn't find issue, please try again", StatusCodes.NOT_FOUND)
    }
    const issue = issueData.rows[0]!
    const { reporter_id, ...restOfIssue } = issue

    const userData: QueryResult<IReporter> = await pool.query<IReporter>(`SELECT id,name,role FROM users WHERE id=$1`, [reporter_id])

    const user = userData.rows[0]
    if (!user) {
        throw new AppError("The reporter for this issue no longer exists", StatusCodes.NOT_FOUND);
    }

    return {
        ...restOfIssue,
        reporter: user
    }

}

const updateIssueInDB = async (
    issueId: string,
    role: string,
    userId: number,
    payload: IIssuePayload
): Promise<IIssue> => {
    
    const issueData = await pool.query(`SELECT * FROM issues WHERE id = $1`, [issueId])
    const issue = issueData.rows[0] as IIssue
    const { title, description, type } = payload

    if (!issue) {
        throw new AppError("Couldn't find issue, please try again", StatusCodes.NOT_FOUND)
    }

    if (role !== "maintainer") {
        if (issue.reporter_id !== userId || issue.status !== "open") {
            throw new AppError("You can only update your own issues while they are still open.", StatusCodes.FORBIDDEN)
        }
    }

    const result: QueryResult<IIssue> = await pool.query<IIssue>(`UPDATE issues SET 
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            type = COALESCE($3, type),
            updated_at = NOW()
            WHERE id = $4
            RETURNING *
        `, [title, description, type, issueId])

    if (result.rowCount === 0) {
        throw new AppError("Issue not found to update", StatusCodes.NOT_FOUND)
    }

    return result.rows[0]!

}

const deleteIssueFromDB = async (id: string) => {
    const result = await pool.query(`DELETE FROM issues WHERE id=$1`, [id])

    if (result.rowCount === 0) {
        return false
    }
    return true
}

export { postIssueInDB, getAllIssuesFromDB, getSingleIssueFromDB, deleteIssueFromDB, updateIssueInDB }