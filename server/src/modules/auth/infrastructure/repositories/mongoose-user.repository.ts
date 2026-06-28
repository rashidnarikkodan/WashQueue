import { User as UserModel } from "../models/user.model"
import { User } from "../../domain/entities/User"
import { UserMapper } from "../mappers/user.mapper"
import { IUserRepository } from "../../domain/repositories/user.repository"

export class MongooseUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const userDoc = await UserModel.findById(id).exec()
    return userDoc ? UserMapper.toDomain(userDoc) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    // Normalise email search (lowercase)
    const userDoc = await UserModel.findOne({ email: email.toLowerCase() }).exec()
    return userDoc ? UserMapper.toDomain(userDoc) : null
  }

  async create(user: User): Promise<User> {
    const persistenceData = UserMapper.toPersistence(user)
    const newUser = new UserModel(persistenceData)
    const savedDoc = await newUser.save()
    return UserMapper.toDomain(savedDoc)
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const persistenceData = UserMapper.toPersistence(user)
    const updatedDoc = await UserModel.findByIdAndUpdate(id, persistenceData, { new: true }).exec()
    return updatedDoc ? UserMapper.toDomain(updatedDoc) : null
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id).exec()
    return !!result
  }
}
