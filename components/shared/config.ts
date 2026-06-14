import {
  ClipboardCheck,
  Medal,
  Plus,
  Search,
  Trophy,
  Users,
} from "lucide-react";

export const participantTabs = [
  { id: "explore", label: "Explore", icon: Search },
  { id: "team", label: "Team Up", icon: Users },
  { id: "portfolio", label: "Portfolio", icon: Trophy },
  { id: "leaderboard", label: "Leaderboard", icon: Medal },
] as const;

export const organizerTabs = [
  { id: "listings", label: "Listings", icon: ClipboardCheck },
  { id: "create", label: "Create", icon: Plus },
  { id: "insights", label: "Insights", icon: Medal },
] as const;

export const setup = ["All", "Online", "Onsite", "Hybrid"] as const;
export const statuses = ["All", "Open", "Closing soon", "Upcoming", "Happening now", "Cancelled"] as const;
export const difficulties = ["All", "Beginner", "Intermediate", "Open"] as const;
export const locations = ["All", "Luzon", "Visayas", "Mindanao"] as const;
