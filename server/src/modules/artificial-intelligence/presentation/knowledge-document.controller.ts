import { Request, Response } from "express"
import {
  ICreateKnowledgeDocumentUseCase,
  IGetKnowledgeDocumentsUseCase,
  IGetKnowledgeDocumentUseCase,
  IUpdateKnowledgeDocumentUseCase,
  IDeleteKnowledgeDocumentUseCase,
  ISearchKnowledgeDocumentUseCase,
} from "../application/interfaces/knowledge-document-usecases.interface"
import success from "@/common/utils/success"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import {
  CreateKnowledgeDocumentDto,
  UpdateKnowledgeDocumentDto,
  GetKnowledgeDocumentsQuery,
} from "../application/dto/knowledge-document.dto"

export class KnowledgeDocumentController {
  constructor(
    private readonly createUseCase: ICreateKnowledgeDocumentUseCase,
    private readonly getAllUseCase: IGetKnowledgeDocumentsUseCase,
    private readonly getByIdUseCase: IGetKnowledgeDocumentUseCase,
    private readonly updateUseCase: IUpdateKnowledgeDocumentUseCase,
    private readonly deleteUseCase: IDeleteKnowledgeDocumentUseCase,
    private readonly searchUseCase: ISearchKnowledgeDocumentUseCase
  ) {}

  create = async (req: Request, res: Response) => {
    const data = await this.createUseCase.execute(req.body as CreateKnowledgeDocumentDto)
    success(res, data, HTTP_STATUS.CREATED, "Knowledge document created successfully")
  }

  getAll = async (req: Request, res: Response) => {
    const data = await this.getAllUseCase.execute(
      req.query as unknown as GetKnowledgeDocumentsQuery
    )
    success(res, data, HTTP_STATUS.OK, "Knowledge documents retrieved successfully")
  }

  getById = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const data = await this.getByIdUseCase.execute(id)
    success(res, data, HTTP_STATUS.OK, "Knowledge document retrieved successfully")
  }

  update = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const data = await this.updateUseCase.execute(id, req.body as UpdateKnowledgeDocumentDto)
    success(res, data, HTTP_STATUS.OK, "Knowledge document updated successfully")
  }

  delete = async (req: Request, res: Response) => {
    const id = req.params.id as string
    await this.deleteUseCase.execute(id)
    success(res, null, HTTP_STATUS.OK, "Knowledge document deleted successfully")
  }

  search = async (req: Request, res: Response) => {
    const data = await this.searchUseCase.execute(req.body)
    success(res, data, HTTP_STATUS.OK, "Knowledge documents searched successfully")
  }
}
