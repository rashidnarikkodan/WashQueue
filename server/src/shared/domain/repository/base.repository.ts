export interface IBaseRepository<T>{
    findById(id:string):Promise<T|null>
    save(entity:T):Promise<T>
    delete(id:string):Promise<void>
    update(id:string, updates:Partial<T>):Promise<T|null>
}