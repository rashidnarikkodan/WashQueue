import cors from "cors"
import env from "./env.config"
export default cors({
  origin: env.CLIENT_URL,
  methods: ["OPTIONS", "GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
})
