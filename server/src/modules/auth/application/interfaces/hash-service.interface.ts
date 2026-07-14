export interface IHashService {
  hash(plain: string): Promise<string>
  verify(hash: string, plain: string): Promise<boolean>
}
