import { NotFoundError } from "@/common/errors/not-found-error";
import { Settlement } from "../../domain/entities/Settlement";
import { ISettlementRepository } from "../../domain/repositories/settlement.repository";
import { IProcessSettlementUseCase } from "../interfaces/settlement.usecases";

export class ProcessSettlementUseCase implements IProcessSettlementUseCase{
    constructor(
        private readonly settlementResitory:ISettlementRepository
    ){}
    async execute(settlementId: string): Promise<Settlement> {
        const settlement = await this.settlementResitory.findById(settlementId)
        if(!settlement){
            throw new NotFoundError('Settlement data with this id is not available')
        }
        return settlement
    }
}