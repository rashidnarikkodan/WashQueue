import { Settlement } from "../../domain/entities/Settlement"

export interface IGetSettlementUseCase{
    execute():void
}
export interface IGetSettlementsUseCase{
    execute():void
}
export interface ICreateSettlementUseCase{
    execute(data:CreateSettlementDTO):Promise<Settlement>
}
export interface IProcessSettlementUseCase{
    execute(settlementId:string):Promise<Settlement>
}