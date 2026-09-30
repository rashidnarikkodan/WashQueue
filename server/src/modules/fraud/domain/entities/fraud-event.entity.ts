import {
  RiskLevel,
  ActorType,
  EntityType,
  FraudEventStatus,
  FraudSignal,
} from "../value-objects/fraud-types.vo";
import { HasId } from "@/core/domain/repository.interface";

export interface FraudEventProps {
  id?: string;
  userId: string;
  actorType: ActorType;
  entityType: EntityType;
  entityId: string;
  eventType: string;
  riskScore: number;
  riskLevel: RiskLevel;
  signals: FraudSignal[];
  reason: string;
  status: FraudEventStatus;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  resolutionNotes?: string | null;
}

export class FraudEvent implements HasId {
  private readonly props: FraudEventProps;

  constructor(props: FraudEventProps) {
    if (!props.userId) {
      throw new Error("FraudEvent requires a userId");
    }
    if (!props.entityId) {
      throw new Error("FraudEvent requires an entityId");
    }
    if (!props.eventType) {
      throw new Error("FraudEvent requires an eventType");
    }

    this.props = {
      ...props,
      riskScore: Math.min(100, Math.max(0, props.riskScore)),
      signals: props.signals ? [...props.signals] : [],
      status: props.status ?? FraudEventStatus.OPEN,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      resolvedAt: props.resolvedAt ?? null,
      resolvedBy: props.resolvedBy ?? null,
      resolutionNotes: props.resolutionNotes ?? null,
    };
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get actorType(): ActorType {
    return this.props.actorType;
  }

  get entityType(): EntityType {
    return this.props.entityType;
  }

  get entityId(): string {
    return this.props.entityId;
  }

  get eventType(): string {
    return this.props.eventType;
  }

  get riskScore(): number {
    return this.props.riskScore;
  }

  get riskLevel(): RiskLevel {
    return this.props.riskLevel;
  }

  get signals(): FraudSignal[] {
    return [...this.props.signals];
  }

  get reason(): string {
    return this.props.reason;
  }

  get status(): FraudEventStatus {
    return this.props.status;
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }

  get updatedAt(): Date {
    return this.props.updatedAt!;
  }

  get resolvedAt(): Date | null | undefined {
    return this.props.resolvedAt;
  }

  get resolvedBy(): string | null | undefined {
    return this.props.resolvedBy;
  }

  get resolutionNotes(): string | null | undefined {
    return this.props.resolutionNotes;
  }

  public startReview(adminId: string): void {
    if (
      this.props.status === FraudEventStatus.RESOLVED ||
      this.props.status === FraudEventStatus.DISMISSED
    ) {
      throw new Error(`Cannot review finalized fraud event`);
    }
    this.props.status = FraudEventStatus.REVIEWING;
    this.props.resolvedBy = adminId;
    this.props.updatedAt = new Date();
  }

  public resolve(adminId: string, notes: string): void {
    this.props.status = FraudEventStatus.RESOLVED;
    this.props.resolvedBy = adminId;
    this.props.resolutionNotes = notes;
    this.props.resolvedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public dismiss(adminId: string, notes: string): void {
    this.props.status = FraudEventStatus.DISMISSED;
    this.props.resolvedBy = adminId;
    this.props.resolutionNotes = notes;
    this.props.resolvedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public toJSON(): FraudEventProps {
    return { ...this.props };
  }
}
