import { User, IUser } from "../models/user.model"
import { IUserRepository } from "../../domain/repositories/user.repository"

export class MongooseUserRepository implements IUserRepository {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec()
  }

  async findByEmail(email: string): Promise<IUser | null> {
    // Normalise email search (lowercase)
    return User.findOne({ email: email.toLowerCase() }).exec()
  }

  async create(user: Partial<IUser>): Promise<IUser> {
    const newUser = new User(user)
    return newUser.save()
  }

  async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, user, { new: true }).exec()
  }

  async delete(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id).exec()
    return !!result
  }
}
