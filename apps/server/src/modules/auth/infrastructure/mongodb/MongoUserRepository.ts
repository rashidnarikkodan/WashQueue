import { User } from '@/modules/auth/domain/entities/User';
import { IUserRepository } from '@/modules/auth/domain/repositories/IUserRepository';
import { UserModel, IUserDocument } from './UserModel';

/**
 * Concrete implementation of IUserRepository using Mongoose.
 * This is the only place that knows about MongoDB.
 */
export class MongoUserRepository implements IUserRepository {
  private toDomain(doc: IUserDocument): User {
    return new User({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      passwordHash: doc.passwordHash,
      role: doc.role,
      isVerified: doc.isVerified,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).select('+passwordHash');
    return doc ? this.toDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    return doc ? this.toDomain(doc) : null;
  }

  async create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'toPublic'>,
  ): Promise<User> {
    const doc = await UserModel.create({
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
      isVerified: data.isVerified,
    });
    const saved = await UserModel.findById(doc._id).select('+passwordHash');
    return this.toDomain(saved!);
  }

  async update(
    id: string,
    data: Partial<Pick<User, 'name' | 'isVerified'>>,
  ): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).select('+passwordHash');
    return doc ? this.toDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await UserModel.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }
}
