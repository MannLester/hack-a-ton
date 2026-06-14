import type { Id } from "@/convex/_generated/dataModel";

export type Hackathon = {
  id: string;
  name: string;
  organizer: string;
  date: string;
  deadline: string;
  setup: "Online" | "Onsite" | "Hybrid";
  location: string;
  region: "Luzon" | "Visayas" | "Mindanao" | "Philippines-wide";
  eligibility: string[];
  teamSize: string;
  prize: string;
  status:
    | "Open"
    | "Closing soon"
    | "Upcoming"
    | "Happening now"
    | "Draft"
    | "Pending review"
    | "Needs edits"
    | "Cancelled";
  difficulty: "Beginner" | "Intermediate" | "Open";
  interested: number;
  lftCount: number;
  summary: string;
  updatedAt?: number;
  cancellationReason?: string;
  cancelledAt?: number;
  cancellationVisibleUntil?: number;
};

export const hackathons: Hackathon[] = [
  {
    id: "ph-ai-build",
    name: "PH AI Build Weekend",
    organizer: "DevCon Manila",
    date: "Jul 19-21, 2026",
    deadline: "Jul 10, 2026",
    setup: "Hybrid",
    location: "BGC, Taguig",
    region: "Luzon",
    eligibility: ["Students", "Professionals", "Beginner-friendly"],
    teamSize: "2-4",
    prize: "PHP 120k pool",
    status: "Closing soon",
    difficulty: "Beginner",
    interested: 348,
    lftCount: 62,
    summary:
      "Build practical AI tools for local government services, education, and community response workflows.",
  },
  {
    id: "fintech-campus-cup",
    name: "Fintech Campus Cup",
    organizer: "PayLab PH",
    date: "Aug 3-4, 2026",
    deadline: "Jul 24, 2026",
    setup: "Online",
    location: "Philippines-wide",
    region: "Philippines-wide",
    eligibility: ["Students", "Open to all schools"],
    teamSize: "3-5",
    prize: "Internship + grants",
    status: "Open",
    difficulty: "Intermediate",
    interested: 221,
    lftCount: 41,
    summary:
      "Create inclusive payment, budgeting, or financial-literacy products for young Filipinos.",
  },
  {
    id: "climate-hack-cebu",
    name: "Climate Hack Cebu",
    organizer: "Cebu Tech Council",
    date: "Sep 12-13, 2026",
    deadline: "Aug 29, 2026",
    setup: "Onsite",
    location: "Cebu City",
    region: "Visayas",
    eligibility: ["Students", "Professionals"],
    teamSize: "2-4",
    prize: "PHP 80k pool",
    status: "Upcoming",
    difficulty: "Open",
    interested: 156,
    lftCount: 29,
    summary:
      "Prototype climate resilience dashboards, reporting tools, and community preparedness apps.",
  },
  {
    id: "game-jam-davao",
    name: "Mindanao Game Jam",
    organizer: "Davao Indie Collective",
    date: "Oct 2-4, 2026",
    deadline: "Sep 18, 2026",
    setup: "Hybrid",
    location: "Davao City",
    region: "Mindanao",
    eligibility: ["Open to all", "Beginner-friendly"],
    teamSize: "1-4",
    prize: "Showcase slots",
    status: "Open",
    difficulty: "Beginner",
    interested: 184,
    lftCount: 53,
    summary:
      "Design small but polished games rooted in Filipino stories, places, and everyday experiences.",
  },
];

export type TeamLooking = {
  convexTeamId?: Id<"teams">;
  leadUserId?: Id<"users">;
  convexHackathonId?: Id<"hackathons">;
  teamName: string;
  missingRoles: string[];
  hackathonName: string;
  hackathonLocation: string;
};

export const teamsLooking: TeamLooking[] = [
  {
    teamName: "AI Public Servants",
    missingRoles: ["AI/ML", "Back-End"],
    hackathonName: "PH AI Build Weekend",
    hackathonLocation: "BGC, Taguig",
  },
  {
    teamName: "PayItForward",
    missingRoles: ["Back-End", "Pitch"],
    hackathonName: "Fintech Campus Cup",
    hackathonLocation: "Philippines-wide",
  },
  {
    teamName: "Green Circuit",
    missingRoles: ["Front-End", "Data"],
    hackathonName: "Climate Hack Cebu",
    hackathonLocation: "Cebu City",
  },
  {
    teamName: "Indie Pixels",
    missingRoles: ["UI/UX", "Front-End"],
    hackathonName: "Mindanao Game Jam",
    hackathonLocation: "Davao City",
  },
];

export const teammates = [
  {
    name: "Mika Reyes",
    role: "Frontend + pitch deck",
    school: "UP Diliman",
    stack: "React, Figma, Tailwind",
    availability: "Weeknights, weekends",
    goal: "Looking for backend or AI teammate for PH AI Build Weekend.",
    match: "92%",
  },
  {
    name: "Andre Santos",
    role: "Backend + data",
    school: "DLSU",
    stack: "Node, Python, PostgreSQL",
    availability: "After 6 PM",
    goal: "Wants a product-minded team for fintech or civic tech builds.",
    match: "87%",
  },
  {
    name: "Gia Lim",
    role: "UX researcher",
    school: "Ateneo",
    stack: "Figma, user interviews, Notion",
    availability: "Saturday full day",
    goal: "Can validate problem statements and build presentation flow.",
    match: "81%",
  },
];

export const badges = [
  "First Hackathon",
  "Team Builder",
  "AI Track",
  "Finalist",
  "Verified Participation",
];

export const portfolioStats = [
  { label: "Participations", value: "7" },
  { label: "Finals", value: "3" },
  { label: "Wins", value: "1" },
  { label: "Teams formed", value: "5" },
];
