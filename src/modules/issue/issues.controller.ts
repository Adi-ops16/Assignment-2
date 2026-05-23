import type { Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { checkQueryParams, sendResponse } from "../../utils";
import type { IJwtPayload } from "../../types";
import type { IIssuePayload } from "./issues.types";
import {
    deleteIssueFromDB,
    getAllIssuesFromDB,
    getSingleIssueFromDB,
    updateIssueInDB,
    postIssueInDB
} from "./issues.service";

const postIssue = async (req: Request, res: Response) => {

    const { id: reporter_id } = req.user as IJwtPayload
    const payload = req.body as IIssuePayload

    const result = await postIssueInDB(payload, reporter_id)

    sendResponse(res, StatusCodes.CREATED, true, "Issue created successfully", result)

}

const getAllIssues = async (req: Request, res: Response) => {
    const params = checkQueryParams(req.query)

    const result = await getAllIssuesFromDB(params)

    sendResponse(res, StatusCodes.OK, true, "Issue retrieved successfully", result)
}

const getSingleIssue = async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await getSingleIssueFromDB(Number(id))

    sendResponse(res, StatusCodes.OK, true, "Issue retrieved successfully", result)
}

const updateIssue = async (req: Request, res: Response) => {
    const issueId = req.params.id as string
    const role = req?.user?.role as string
    const userId = req?.user?.id as number
    const result = await updateIssueInDB(issueId, role, userId, req.body)

    sendResponse(res, StatusCodes.OK, true, "Issue updated successfully", result)

}

const deleteIssue = async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await deleteIssueFromDB(id as string)
    if (!result) {
        return sendResponse(res, StatusCodes.NOT_FOUND, false, "Issue doesn't exist, try a different id")
    }
    sendResponse(res, StatusCodes.OK, true, "Issue deleted successfully")
}

export { postIssue, getAllIssues, getSingleIssue, deleteIssue, updateIssue }