import dotenv from 'dotenv'
import { env } from 'node:process'

dotenv.config({ quiet: true })

const config = {
    port: env.PORT,
    dbUrl: env.DB_URL,
    jwtSecret: env.JWT_ACCESS_SECRET as string,
    tokenTime: env.JWT_TOKEN_TIME
}

export default config