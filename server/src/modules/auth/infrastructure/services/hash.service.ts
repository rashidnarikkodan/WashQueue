import argon2 from "argon2"
import { IHashService } from "../../application/interfaces/hash-service.interface"

export class Argon2HashService implements IHashService {
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain)
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain)
  }
}
