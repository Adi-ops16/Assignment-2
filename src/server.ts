import app from "./app"
import config from "./config"
import { initDB } from "./db"

const server = () => {
    initDB()
    app.listen(config.port, () => {
        console.log(`Server is running on PORT ${config.port}`)
    })
}

server()