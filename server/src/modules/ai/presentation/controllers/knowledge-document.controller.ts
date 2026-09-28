import { Request, Response } from "express"
import { KnowledgeDocumentService } from "../../application/knowledge-document.service"
import success from "@/common/utils/success"
import { HTTP_STATUS } from "@/common/constants/http.constants"

export class KnowledgeDocumentController {
  constructor(private readonly service: KnowledgeDocumentService) {}

  create = async (req: Request, res: Response) => {
    const data = await this.service.create(req.body)
    success(res, data, HTTP_STATUS.CREATED, "Knowledge document created successfully")
  }

  getAll = async (req: Request, res: Response) => {
    const data = await this.service.findAll(req.query)
    success(res, data, HTTP_STATUS.OK, "Knowledge documents retrieved successfully")
  }

  getById = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const data = await this.service.findById(id)
    success(res, data, HTTP_STATUS.OK, "Knowledge document retrieved successfully")
  }

  update = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const data = await this.service.update(id, req.body)
    success(res, data, HTTP_STATUS.OK, "Knowledge document updated successfully")
  }

  delete = async (req: Request, res: Response) => {
    const id = req.params.id as string
    await this.service.delete(id)
    success(res, null, HTTP_STATUS.OK, "Knowledge document deleted successfully")
  }
}
