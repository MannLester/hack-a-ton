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
] as const;

export const organizerTabs = [
  { id: "listings", label: "Listings", icon: ClipboardCheck },
  { id: "create", label: "Create", icon: Plus },
  { id: "insights", label: "Insights", icon: Medal },
] as const;

export const formats = ["All", "Online", "Onsite", "Hybrid"] as const;
export const themes = [
  "All",
  "AI",
  "Fintech",
  "Civic Tech",
  "Climate",
  "Gaming",
  "Web",
] as const;
