export enum StationStatus {
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  REJECTED = "REJECTED",
}

export const STATION_STATUS = StationStatus

export interface StationImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
}

export interface StationContact {
  phone: string;
  email: string;
}

export interface StationLocation {
  latitude: number;
  longitude: number;
}

export interface StationAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface OperatingHour {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface Holiday {
  date: Date;
  reason?: string;
}

export interface SlotConfiguration {
  bays: number;
  windowDurationMins: number;
  capacityPerWindow: number;
  walkInReservedSlots: number;
  maxAdvanceBookingDays: number;
  allowWalkIns: boolean;
}

export interface StationProps {
  id: string;
  ownerId: string;
  managerId?: string;

  name: string;
  description: string;

  contact: StationContact;

  location: StationLocation;
  address: StationAddress;

  images: StationImage[];

  operatingHours: OperatingHour[];
  holidays: Holiday[];

  slotConfig: SlotConfiguration;

  amenities: string[];

  rating: number;
  reviewCount: number;

  verifiedAt?: Date;
  rejectionReason?: string;

  status: StationStatus;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export class Station {
  constructor(private props: StationProps) {}

  get id() {
    return this.props.id;
  }

  get ownerId() {
    return this.props.ownerId;
  }

  get managerId() {
    return this.props.managerId;
  }

  get status() {
    return this.props.status;
  }

  getProps(): StationProps {
    return { ...this.props };
  }

  toJSON(): StationProps {
    return this.getProps();
  }

  updateBasicInformation(data: {
    name: string;
    description: string;
    contact: StationContact;
    location: StationLocation;
    address: StationAddress;
    images: StationImage[];
  }): void {
    this.props.name = data.name;
    this.props.description = data.description;
    this.props.contact = data.contact;
    this.props.location = data.location;
    this.props.address = data.address;
    this.props.images = data.images;

    this.touch();
  }

  updateAvailability(data: {
    operatingHours: OperatingHour[];
    holidays: Holiday[];
    slotConfig: SlotConfiguration;
  }): void {
    this.props.operatingHours = data.operatingHours;
    this.props.holidays = data.holidays;
    this.props.slotConfig = data.slotConfig;

    this.touch();
  }

  updateAmenities(amenities: string[]): void {
    this.props.amenities = amenities;
    this.touch();
  }

  assignManager(managerId?: string): void {
    this.props.managerId = managerId
    this.touch()
  }

  updateStatus(status: StationStatus): void {
    this.props.status = status;
    this.props.isActive = status === StationStatus.ACTIVE;
    this.touch();
  }

  submit(): void {
    if (this.props.status !== StationStatus.DRAFT && this.props.status !== StationStatus.REJECTED) {
      throw new Error("Only draft or rejected stations can be submitted.");
    }

    this.props.status = StationStatus.PENDING_REVIEW;
    this.props.rejectionReason = undefined;
    this.touch();
  }

  activate(): void {
    this.props.status = StationStatus.ACTIVE;
    this.props.isActive = true;
    this.props.verifiedAt = new Date();
    this.props.rejectionReason = undefined;
    this.touch();
  }

  reject(reason: string): void {
    this.props.status = StationStatus.REJECTED;
    this.props.isActive = false;
    this.props.rejectionReason = reason;
    this.props.verifiedAt = undefined;
    this.touch();
  }

  suspend(reason?: string): void {
    this.props.status = StationStatus.SUSPENDED;
    this.props.isActive = false;

    if (reason) {
      this.props.rejectionReason = reason;
    }

    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}