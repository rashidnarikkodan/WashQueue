export interface ActiveBooking {
  id: string;
  queuePosition: string;
  status: string;
  estimatedWait: string;
  bayInfo: string;
  vehicleName: string;
  steps: {
    label: string;
    status: "completed" | "current" | "upcoming";
  }[];
}

export interface QueueIntelligence {
  averageWait: string;
  washSpeed: string;
}

export interface WeatherInsights {
  temperature: string;
  alertTitle: string;
  alertDetails: string;
}

export interface GarageVehicle {
  id: string;
  brand: string;
  model: string;
  plate: string;
  image: string;
  status: "good" | "overdue";
  statusText: string;
  isPrimary: boolean;
  typeBadges: string[];
  modelYear: string;
  lastWash: string;
  nextWash: string;
  usage: string;
}

export interface WalletInfo {
  balance: string;
  loyaltyPoints: string;
  tierProgress: number;
  pointsToNextTier: string;
  rewardDetails: string;
}

export const MOCK_DASHBOARD_DATA = {
  user: {
    name: "Alex",
    greeting: "Good Morning"
  },
  activeBooking: {
    id: "#WQ-9982",
    queuePosition: "#07",
    status: "QUEUED",
    estimatedWait: "14 minutes",
    bayInfo: "Bay 3",
    vehicleName: "Porsche 911 GT3 RS",
    steps: [
      { label: "Confirmed", status: "completed" },
      { label: "Queued", status: "current" },
      { label: "Washing", status: "upcoming" },
      { label: "Drying", status: "upcoming" },
      { label: "Ready", status: "upcoming" }
    ]
  } as ActiveBooking,
  queueIntelligence: {
    averageWait: "18.5m",
    washSpeed: "12.2 min"
  } as QueueIntelligence,
  weatherInsights: {
    temperature: "78°F",
    alertTitle: "High Demand Alert",
    alertDetails: "Clear skies expected for 3 days. Demand projected to increase by 40% this afternoon."
  } as WeatherInsights,
  garage: [
    {
      id: "v1",
      brand: "Honda",
      model: "City",
      plate: "MH 01 AB 1234",
      image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80",
      status: "good",
      statusText: "Good Condition",
      isPrimary: true,
      typeBadges: ["CAR", "SEDAN"],
      modelYear: "2023",
      lastWash: "Oct 12, 2023",
      nextWash: "In 14 Days",
      usage: "Daily"
    },
    {
      id: "v2",
      brand: "Porsche",
      model: "911 GT3 RS",
      plate: "DL 03 CC 9876",
      image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80",
      status: "overdue",
      statusText: "Overdue",
      isPrimary: false,
      typeBadges: ["SPORTS", "COUPE"],
      modelYear: "2024",
      lastWash: "Sept 05, 2023",
      nextWash: "Overdue by 5 Days",
      usage: "Weekend"
    }
  ] as GarageVehicle[],
  wallet: {
    balance: "$240.50",
    loyaltyPoints: "12,450 WQ",
    tierProgress: 85,
    pointsToNextTier: "2,550 points",
    rewardDetails: "You're 2,550 points away from a complimentary 'Ceramic Glaze' service."
  } as WalletInfo,
  supportLinks: [
    { label: "Help Center", path: "/help" },
    { label: "Live Agent", path: "/chat" }
  ]
};
