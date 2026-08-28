import ari from "../assets/images/avatar-4.png";
import jo from "../assets/images/avatar-2.png";
import mia from "../assets/images/avatar-5.png";
import nic from "../assets/images/avatar-3.png";
import ren from "../assets/images/avatar-1.png";

import lisbon from "../assets/images/Lisbon.jpg";
import japan from "../assets/images/japan.jpg";
import brazil from "../assets/images/Brazil.jpg";

export type Member = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  isOrganizer?: boolean;
  isYou?: boolean;
};

export const members: Record<string, Member> = {
  ari: { id: "ari", name: "Ari", avatar: ari, email: "ari@trip.com", isYou: true },
  jo: { id: "jo", name: "Jo", avatar: jo, email: "jo@trip.com", isOrganizer: true },
  mia: { id: "mia", name: "Mia", avatar: mia, email: "mia@trip.com" },
  nic: { id: "nic", name: "Nic", avatar: nic, email: "nic@trip.com" },
  ren: { id: "ren", name: "Ren", avatar: ren, email: "ren@trip.com" },
};

export type Trip = {
  id: string;
  name: string;
  cover: string;
  startDate: string;
  endDate: string;
  spent: number;
  memberIds: string[];
  flagColor: string;
};

export const trips: Trip[] = [
  {
    id: "lisbon",
    name: "Lisbon",
    cover: lisbon,
    startDate: "2026-08-19",
    endDate: "2026-08-24",
    spent: 1847.3,
    memberIds: ["ari", "jo", "mia", "nic"],
    flagColor: "214,20,20",
  },
  {
    id: "japan",
    name: "Japan",
    cover: japan,
    startDate: "2026-09-18",
    endDate: "2026-09-28",
    spent: 0,
    memberIds: ["ari", "jo"],
    flagColor: "188,0,45",
  },
  {
    id: "brazil",
    name: "Brazil",
    cover: brazil,
    startDate: "2027-06-04",
    endDate: "2027-06-20",
    spent: 0,
    memberIds: ["ari", "mia"],
    flagColor: "0,151,57",
  },
];

export const tripSummaryText =
  "A relaxed last stretch through Lisbon's hills and trams, with a big group dinner tonight before everyone flies home.";

export type ItineraryItem = {
  id: string;
  day: string;
  time: string;
  title: string;
  subtitle?: string;
  pending?: boolean;
};

export const itinerary: ItineraryItem[] = [
  { id: "1", day: "Wed, 19 Aug", time: "15:00", title: "Check-in — Chiado Apartment", subtitle: "Rua do Alecrim" },
  { id: "2", day: "Wed, 19 Aug", time: "20:00", title: "Welcome dinner", subtitle: "Time Out Market" },
  { id: "3", day: "Thu, 20 Aug", time: "10:00", title: "Belém walking tour" },
  { id: "4", day: "Thu, 20 Aug", time: "19:30", title: "Fado night", subtitle: "Alfama" },
  { id: "5", day: "Fri, 21 Aug", time: "09:00", title: "Sintra day trip" },
  { id: "6", day: "Sat, 22 Aug", time: "11:00", title: "Tram 28 ride" },
  { id: "7", day: "Sat, 22 Aug", time: "21:00", title: "Bairro Alto bar hop" },
  { id: "8", day: "Sun, 23 Aug", time: "Free day", title: "Beach at Cascais" },
  { id: "9", day: "Mon, 24 Aug", time: "19:00", title: "Dinner", pending: true },
];

export type PollOption = {
  id: string;
  label: string;
  voterIds: string[];
};

export type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  createdById: string;
  closed: boolean;
  category: ExpenseCategory;
};

export type ExpenseLineItem = {
  id: string;
  name: string;
  amount: number;
  splitIds: string[];
  excludedIds?: string[];
};

export type ExpenseGroup = {
  id: string;
  icon: string;
  name: string;
  amount: number;
  splitIds?: string[];
  items?: ExpenseLineItem[];
};

export const dinnerExpense = {
  title: "Dinner · Cafe Sunset",
  paidById: "ari",
  amount: 214.0,
  groups: [
    { id: "food", icon: "🍴", name: "Food", amount: 164, splitIds: ["ari", "jo", "mia", "nic", "ren"] },
    {
      id: "drinks",
      icon: "🍷",
      name: "Drinks",
      amount: 50,
      items: [
        { id: "beer", name: "Cervejas ×4", amount: 16, splitIds: ["ari", "jo", "mia", "nic", "ren"] },
        {
          id: "wine",
          name: "Wine (garrafa)",
          amount: 35,
          splitIds: ["ari", "jo", "mia"],
          excludedIds: ["nic", "ren"],
        },
      ],
    },
  ] as ExpenseGroup[],
};

export type ExpenseCategory =
  | "food"
  | "drinks"
  | "experience"
  | "transport"
  | "accommodation"
  | "shopping"
  | "other";

export type WorkingItem = {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  splitIds: string[];
  confirmed?: boolean;
};

export type ScannedItem = {
  id: string;
  name: string;
  amount: number;
  confirmed: boolean;
  category: ExpenseCategory;
};

export const scannedReceiptItems: ScannedItem[] = [
  { id: "s1", name: "Bacalhau à Brás ×2", amount: 28, confirmed: true, category: "food" },
  { id: "s2", name: "Arroz de marisco ×2", amount: 24, confirmed: true, category: "food" },
  { id: "s3", name: "Polvo à lagareiro", amount: 22, confirmed: true, category: "food" },
  { id: "s5", name: "Vinho tinto (garrafa)", amount: 35, confirmed: true, category: "drinks" },
  { id: "s6", name: "Cervejas ×4", amount: 16, confirmed: true, category: "drinks" },
];

export const receiptSummary = { subtotal: 155, service: 15.5, total: 170.5 };

export const categoryMeta: Record<ExpenseCategory, { label: string; icon: string }> = {
  food: { label: "Food", icon: "🍴" },
  drinks: { label: "Drinks", icon: "🍷" },
  experience: { label: "Experience", icon: "🎟️" },
  transport: { label: "Transport", icon: "🚕" },
  accommodation: { label: "Stay", icon: "🏨" },
  shopping: { label: "Shopping", icon: "🛍️" },
  other: { label: "Other", icon: "📦" },
};

export const CATEGORY_ORDER: ExpenseCategory[] = [
  "food",
  "drinks",
  "experience",
  "transport",
  "accommodation",
  "shopping",
  "other",
];

export function flagGradient(rgb: string) {
  return `linear-gradient(180deg, rgba(${rgb},0.78) 0%, rgba(${rgb},0.45) 30%, rgba(${rgb},0.12) 55%, rgba(0,0,0,0.08) 75%, rgba(0,0,0,0.45) 100%)`;
}

export type ExpenseHistoryLineItem = {
  name: string;
  amount: number;
  category: ExpenseCategory;
  splitIds: string[];
  excludedIds?: string[];
};

export type ExpenseHistoryItem = {
  id: string;
  name: string;
  date: string;
  amount: number;
  paidById: string;
  items?: ExpenseHistoryLineItem[];
};

const ORIGINAL_MEMBERS = trips[0].memberIds;

export const expenseHistory: ExpenseHistoryItem[] = [
  {
    id: "e5",
    name: "Farewell gift for Mia",
    date: "2026-08-23",
    amount: 35.0,
    paidById: "ari",
    items: [{ name: "Perfume bottle", amount: 35, category: "shopping", splitIds: ["mia"] }],
  },
  {
    id: "e4",
    name: "Sintra day trip tickets",
    date: "2026-08-21",
    amount: 96.0,
    paidById: "mia",
    items: [
      { name: "Train tickets ×5", amount: 46, category: "transport", splitIds: ORIGINAL_MEMBERS },
      { name: "Pena Palace entry ×5", amount: 40, category: "experience", splitIds: ORIGINAL_MEMBERS },
      { name: "Water & snacks", amount: 10, category: "drinks", splitIds: ORIGINAL_MEMBERS },
    ],
  },
  {
    id: "e3",
    name: "Fado night tickets",
    date: "2026-08-20",
    amount: 120.0,
    paidById: "jo",
    items: [
      { name: "Fado show tickets ×5", amount: 100, category: "experience", splitIds: ORIGINAL_MEMBERS },
      { name: "Port wine tasting", amount: 20, category: "drinks", splitIds: ORIGINAL_MEMBERS },
    ],
  },
  {
    id: "e2",
    name: "Chiado apartment deposit",
    date: "2026-08-19",
    // Jo fronted the deposit, which is what leaves Ari as the trip's biggest
    // net debtor — the balances screen gives her a Pay button instead of a
    // Nudge.
    paidById: "jo",
    amount: 980.0,
    items: [{ name: "Apartment deposit", amount: 980, category: "accommodation", splitIds: ORIGINAL_MEMBERS }],
  },
  {
    id: "e1",
    name: "Airport taxi",
    date: "2026-08-19",
    amount: 437.3,
    paidById: "nic",
    // Ari arrived separately and skipped this ride, so she's excluded — that
    // keeps her balance with Nic at exactly zero instead of adding a third
    // open row for her on the demo balances screen.
    items: [
      { name: "Taxi to Chiado apartment", amount: 437.3, category: "transport", splitIds: ["jo", "mia", "nic"] },
    ],
  },
];

export type MapPin = {
  id: string;
  label: string;
  x: number;
  y: number;
  visited?: boolean;
};

export const itineraryMapPins: MapPin[] = [
  { id: "chiado", label: "Chiado Apartment", x: 40, y: 90, visited: true },
  { id: "timeout", label: "Time Out Market", x: 48, y: 83, visited: true },
  { id: "belem", label: "Belém Tower", x: 3, y: 96, visited: true },
  { id: "alfama", label: "Alfama (Fado)", x: 52, y: 76, visited: true },
  { id: "sintra", label: "Sintra", x: 4, y: 4, visited: true },
  { id: "bairroalto", label: "Bairro Alto", x: 33, y: 78 },
  { id: "cascais", label: "Cascais Beach", x: 2, y: 50 },
  { id: "restaurant", label: "Tonight's dinner", x: 51, y: 40 },
];

export function formatSingleDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDateRange(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const year = end.getFullYear();

  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} - ${end.getDate()} ${MONTHS[end.getMonth()]} ${year}`;
  }
  return `${start.getDate()} ${MONTHS[start.getMonth()]} - ${end.getDate()} ${MONTHS[end.getMonth()]} ${year}`;
}

export function formatShortDate(startISO: string, endISO: string) {
  return formatDateRange(startISO, endISO);
}

export function tripDayRange(startISO: string, endISO: string): string[] {
  const days: string[] = [];
  const cursor = new Date(startISO);
  const end = new Date(endISO);
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function activeParticipantIds(
  memberIds: string[],
  joinDates: Record<string, string>,
  onOrBeforeDate: string,
  fallbackDate: string
): string[] {
  return memberIds.filter((id) => (joinDates[id] ?? fallbackDate) <= onOrBeforeDate);
}
