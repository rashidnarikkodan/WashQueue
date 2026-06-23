import { User } from '../entities/User';

/**
 * Repository interface (port) — defines the contract that the infrastructure
 * layer must implement. The domain layer never imports from infrastructure.
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'toPublic'>): Promise<User>;
  update(id: string, data: Partial<Pick<User, 'name' | 'isVerified'>>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
}
