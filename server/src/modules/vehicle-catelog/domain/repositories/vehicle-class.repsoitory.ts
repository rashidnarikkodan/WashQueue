import { IBaseRepository } from "@/core/domain/repository.interface";
import { VehicleClass } from "../entities/VehicleClass";

export interface IVehicleClassRepository extends IBaseRepository<VehicleClass>{}