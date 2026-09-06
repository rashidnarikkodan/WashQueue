export interface HasId {
  id?: string
}

export interface IMapper<TDomain, TPersist> {
  toDomain(raw: TPersist): TDomain
  toPersistence(entity: Partial<TDomain>): Partial<TPersist>
}

export interface IBaseRepository<T extends HasId> {
  findById(id: string): Promise<T | null>
  save(entity: T): Promise<T>
  delete(id: string): Promise<void>
  update(id: string, updates: Partial<T>): Promise<T | null>
}
