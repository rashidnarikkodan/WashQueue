import { Router } from "express"
import { knowledgeDocumentRoutes } from "./presentation/routes/knowledge-document.routes"

const router = Router()

router.use("/knowledge-documents", knowledgeDocumentRoutes)

export default router
