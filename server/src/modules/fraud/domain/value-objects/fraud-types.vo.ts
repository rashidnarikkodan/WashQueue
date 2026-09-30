export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum ActorType {
  CUSTOMER = "CUSTOMER",
  OWNER = "OWNER",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
  SYSTEM = "SYSTEM",
}

export enum EntityType {
  BOOKING = "BOOKING",
  PAYMENT = "PAYMENT",
  WALLET = "WALLET",
  STATION = "STATION",
  REVIEW = "REVIEW",
  USER = "USER",
}

export enum FraudEventStatus {
  OPEN = "OPEN",
  REVIEWING = "REVIEWING",
  RESOLVED = "RESOLVED",
  DISMISSED = "DISMISSED",
}

export interface FraudSignal {
  code: string;
  description: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  signals: FraudSignal[];
  reason: string;
}
