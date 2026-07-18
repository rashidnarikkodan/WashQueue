export interface StationProps {
  id: string;
  ownerId: string;

  name: string;
  description: string;

  contactPhone: string;
  contactEmail: string;

  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };

  address: string;
  pincode: string;
  city: string;
  state: string;

  images: StationImage[];

  bays: number;
  avgServiceTime: number;

  operatingHours: OperatingHour[];
  holidays: Holiday[];
  amenities: string[];

  rating: number;
  reviewCount: number;

  verifiedAt: Date | null;
  rejectionReason: string | null;

  status: StationStatus;
  isActive: boolean;

  createdAt: Date;
}

export interface StationImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
}

export interface OperatingHour {
  day: DayOfWeek;
  open: string; // HH:mm
  close: string; // HH:mm
  isClosed: boolean;
}

export interface Holiday {
  date: Date;
  reason: string;
}

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type StationStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "REJECTED";

export class Station {
  constructor(private readonly props: StationProps) {}

  get id() {
    return this.props.id;
  }

  get ownerId() {
    return this.props.ownerId;
  }

  get name() {
    return this.props.name;
  }

  get description() {
    return this.props.description;
  }

  get contactPhone() {
    return this.props.contactPhone;
  }

  get contactEmail() {
    return this.props.contactEmail;
  }

  get location() {
    return this.props.location;
  }

  get address() {
    return this.props.address;
  }

  get pincode() {
    return this.props.pincode;
  }

  get city() {
    return this.props.city;
  }

  get state() {
    return this.props.state;
  }

  get images() {
    return this.props.images;
  }

  get bays() {
    return this.props.bays;
  }

  get avgServiceTime() {
    return this.props.avgServiceTime;
  }

  get operatingHours() {
    return this.props.operatingHours;
  }

  get holidays() {
    return this.props.holidays;
  }

  get amenities() {
    return this.props.amenities;
  }

  get rating() {
    return this.props.rating;
  }

  get reviewCount() {
    return this.props.reviewCount;
  }

  get verifiedAt() {
    return this.props.verifiedAt;
  }

  get rejectionReason() {
    return this.props.rejectionReason;
  }

  get status() {
    return this.props.status;
  }

  get isActive() {
    return this.props.isActive;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}