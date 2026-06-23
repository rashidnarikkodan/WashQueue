/**
 * Pure domain entity — no ORM, no framework dependencies.
 * Represents the concept of a User in the business domain.
 */
export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'admin' | 'staff';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: UserProps['role'];
  readonly isVerified: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.isVerified = props.isVerified;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Returns a safe representation (no password hash)
   */
  toPublic(): Omit<UserProps, 'passwordHash'> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      isVerified: this.isVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
