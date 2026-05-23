import { Router } from "express";
import { deleteIssue, getAllIssues, getSingleIssue, postIssue, updateIssue } from "./issues.controller";
import auth from "../../middlewares/authentication";
import { userRoles } from "../../types/roles";

const router = Router()

router.post("/", auth(userRoles.CONTRIBUTOR, userRoles.MAINTAINER), postIssue)
router.get("/", getAllIssues)
router.get("/:id", getSingleIssue)
router.patch("/:id", auth(userRoles.CONTRIBUTOR, userRoles.MAINTAINER), updateIssue)
router.delete("/:id", auth(userRoles.MAINTAINER), deleteIssue)

export const issueRoute = router