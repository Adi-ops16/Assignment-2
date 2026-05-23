import express, { type Application } from 'express'
const app: Application = express()
import { StatusCodes } from 'http-status-codes'
import { authRoute } from './modules/auth/auth.route'
import { globalErrorHandler } from './middlewares/globalErrorHandler'
import { issueRoute } from './modules/issue/issues.route'

app.use(express.json())

app.use("/api/auth", authRoute)
app.use("/api/issues", issueRoute)


// Server Health Check
app.get("/", (req, res) => {
    res.status(StatusCodes.OK).json({ message: "Server is running" })
})

app.use(globalErrorHandler)

export default app