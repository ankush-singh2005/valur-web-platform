// =============================================================================
// Valur Admin Console - Iceland-first mock dataset
// Football context (Valur is an Icelandic club). ISK amounts, VSK 24%, Icelandic
// names. Static + deterministic so screens render identically every load.
// =============================================================================
import { netPayout, platformFee, vsk } from "../lib/format";
import type { Persona, SessionType } from "../lib/constants";

// ---- Coaches --------------------------------------------------------------
export interface Credential {
  title: string;
  institution: string;
  year: number;
  verified: boolean;
}
export interface Coach {
  id: string;
  name: string;
  location: string;
  tier: string;
  sessionTypes: SessionType[];
  status: "Active" | "Pending" | "Suspended";
  rating: number;
  sessionsDelivered: number;
  totalEarned: number;
  joined: string;
  email: string;
  specialties: string[];
  languages: string[];
  experience: number;
  hybridEnabled: boolean;
  appliedAt?: string;
  credentials: Credential[];
  payoutAccount: string;
  bio: string;
}

export const coaches: Coach[] = [
  { id: "co-001", name: "Eiður Smárason", location: "Reykjavík", tier: "Marquee", sessionTypes: ["F2F", "Online", "Hybrid"], status: "Active", rating: 4.9, sessionsDelivered: 412, totalEarned: 9_840_000, joined: "2025-09-12", email: "eidur@valur.is", specialties: ["Finishing", "Striker movement"], languages: ["Íslenska", "English"], experience: 14, hybridEnabled: true, credentials: [{ title: "UEFA Pro Licence", institution: "KSÍ", year: 2019, verified: true }, { title: "MSc Sports Coaching", institution: "Loughborough", year: 2014, verified: true }], payoutAccount: "0133-26-004182", bio: "Former national-team striker, now coaching elite finishing." },
  { id: "co-002", name: "Aron Einar Pálsson", location: "Hafnarfjörður", tier: "Pro", sessionTypes: ["F2F", "Hybrid"], status: "Active", rating: 4.7, sessionsDelivered: 268, totalEarned: 5_120_000, joined: "2025-10-03", email: "aron@coaches.is", specialties: ["Midfield control", "Set pieces"], languages: ["Íslenska", "English"], experience: 9, hybridEnabled: true, credentials: [{ title: "UEFA A Licence", institution: "KSÍ", year: 2021, verified: true }], payoutAccount: "0526-14-771203", bio: "Possession-based midfield specialist." },
  { id: "co-003", name: "Margrét Lára Jóns", location: "Kópavogur", tier: "Pro", sessionTypes: ["Online", "Hybrid"], status: "Active", rating: 4.8, sessionsDelivered: 190, totalEarned: 4_010_000, joined: "2025-11-20", email: "margret@coaches.is", specialties: ["Goalkeeping", "Distribution"], languages: ["Íslenska"], experience: 11, hybridEnabled: true, credentials: [{ title: "GK Coaching Diploma", institution: "FA", year: 2018, verified: true }], payoutAccount: "0301-22-118890", bio: "Goalkeeping coach with international playing background." },
  { id: "co-004", name: "Birkir Bjarnason", location: "Akureyri", tier: "Local", sessionTypes: ["F2F"], status: "Active", rating: 4.5, sessionsDelivered: 96, totalEarned: 1_520_000, joined: "2026-01-08", email: "birkir@coaches.is", specialties: ["Youth development"], languages: ["Íslenska", "English", "Norsk"], experience: 6, hybridEnabled: false, credentials: [{ title: "UEFA B Licence", institution: "KSÍ", year: 2022, verified: true }], payoutAccount: "0708-19-553021", bio: "Grassroots-to-academy youth pathway coach." },
  { id: "co-005", name: "Gylfi Þór Sigurðs", location: "Reykjavík", tier: "Pro", sessionTypes: ["Online"], status: "Pending", rating: 0, sessionsDelivered: 0, totalEarned: 0, joined: "2026-06-26", appliedAt: "2026-06-26T09:10:00Z", email: "gylfi@gmail.com", specialties: ["Playmaking", "Free kicks"], languages: ["Íslenska", "English"], experience: 12, hybridEnabled: true, credentials: [{ title: "UEFA A Licence", institution: "KSÍ", year: 2020, verified: false }, { title: "Performance Analysis Cert.", institution: "PFSA", year: 2023, verified: false }], payoutAccount: "0133-26-990011", bio: "Creative playmaker transitioning to online masterclasses." },
  { id: "co-006", name: "Hólmar Örn Eyjólfs", location: "Selfoss", tier: "Local", sessionTypes: ["F2F", "Online"], status: "Pending", rating: 0, sessionsDelivered: 0, totalEarned: 0, joined: "2026-06-24", appliedAt: "2026-06-24T14:40:00Z", email: "holmar@outlook.com", specialties: ["Defending", "1v1"], languages: ["Íslenska"], experience: 7, hybridEnabled: false, credentials: [{ title: "UEFA B Licence", institution: "KSÍ", year: 2023, verified: false }], payoutAccount: "0142-08-220394", bio: "Defensive structure and pressing." },
  { id: "co-007", name: "Dagný Brynjars", location: "Garðabær", tier: "Grassroots", sessionTypes: ["F2F"], status: "Pending", rating: 0, sessionsDelivered: 0, totalEarned: 0, joined: "2026-06-22", appliedAt: "2026-06-22T08:05:00Z", email: "dagny@gmail.com", specialties: ["Fundamentals", "Ball mastery"], languages: ["Íslenska", "English"], experience: 4, hybridEnabled: false, credentials: [{ title: "Grassroots Cert.", institution: "KSÍ", year: 2024, verified: false }], payoutAccount: "0311-45-667788", bio: "Early-years technical fundamentals." },
  { id: "co-008", name: "Rúrik Gíslason", location: "Reykjavík", tier: "Pro", sessionTypes: ["F2F", "Online", "Hybrid"], status: "Suspended", rating: 4.2, sessionsDelivered: 142, totalEarned: 2_980_000, joined: "2025-12-01", email: "rurik@coaches.is", specialties: ["Wing play", "Crossing"], languages: ["Íslenska", "English", "Deutsch"], experience: 10, hybridEnabled: true, credentials: [{ title: "UEFA A Licence", institution: "KSÍ", year: 2019, verified: true }], payoutAccount: "0533-77-001245", bio: "Suspended pending a conduct review." },
  { id: "co-009", name: "Sara Björk Gunn", location: "Kópavogur", tier: "Marquee", sessionTypes: ["Online", "Hybrid"], status: "Active", rating: 5.0, sessionsDelivered: 333, totalEarned: 8_220_000, joined: "2025-08-30", email: "sara@valur.is", specialties: ["Midfield IQ", "Leadership"], languages: ["Íslenska", "English", "Svenska"], experience: 15, hybridEnabled: true, credentials: [{ title: "UEFA Pro Licence", institution: "KSÍ", year: 2020, verified: true }], payoutAccount: "0133-26-553311", bio: "Decorated international midfielder and mentor." },
  { id: "co-010", name: "Kolbeinn Sigþórs", location: "Reykjanesbær", tier: "Local", sessionTypes: ["F2F", "Hybrid"], status: "Active", rating: 4.4, sessionsDelivered: 71, totalEarned: 1_140_000, joined: "2026-02-14", email: "kolbeinn@coaches.is", specialties: ["Target play", "Hold-up"], languages: ["Íslenska", "English"], experience: 8, hybridEnabled: true, credentials: [{ title: "UEFA B Licence", institution: "KSÍ", year: 2021, verified: true }], payoutAccount: "0712-33-884412", bio: "Centre-forward hold-up play." },
];

// ---- Players --------------------------------------------------------------
export interface Player {
  id: string;
  name: string;
  tier: string;
  variant: "Athlete" | "Coach-learner";
  position: string;
  sessionsBooked: number;
  lifetimeSpend: number;
  videoStatus: "Not started" | "Pending" | "Verified" | "Re-submission requested";
  joined: string;
  email: string;
  dob: string;
  minor: boolean;
  club?: string;
}
export const players: Player[] = [
  { id: "pl-001", name: "Viktor Andri", tier: "Advanced", variant: "Athlete", position: "Striker", sessionsBooked: 22, lifetimeSpend: 286_000, videoStatus: "Verified", joined: "2025-10-11", email: "viktor.a@gmail.com", dob: "2009-03-14", minor: true, club: "Valur" },
  { id: "pl-002", name: "Emilía Rós", tier: "Intermediate", variant: "Athlete", position: "Midfielder", sessionsBooked: 14, lifetimeSpend: 168_000, videoStatus: "Pending", joined: "2025-11-02", email: "emilia.r@gmail.com", dob: "2010-07-22", minor: true, club: "Breiðablik" },
  { id: "pl-003", name: "Stefán Logi", tier: "Beginner", variant: "Athlete", position: "Defender", sessionsBooked: 5, lifetimeSpend: 54_000, videoStatus: "Not started", joined: "2026-03-19", email: "stefan.l@gmail.com", dob: "2012-01-09", minor: true },
  { id: "pl-004", name: "Hekla Dögg", tier: "Advanced", variant: "Coach-learner", position: "Goalkeeper", sessionsBooked: 31, lifetimeSpend: 402_000, videoStatus: "Verified", joined: "2025-09-25", email: "hekla.d@gmail.com", dob: "2004-05-30", minor: false, club: "KR" },
  { id: "pl-005", name: "Aron Daði", tier: "Intermediate", variant: "Athlete", position: "Winger", sessionsBooked: 18, lifetimeSpend: 214_000, videoStatus: "Re-submission requested", joined: "2025-12-08", email: "aron.d@gmail.com", dob: "2008-11-17", minor: true, club: "FH" },
  { id: "pl-006", name: "Katla Sól", tier: "Beginner", variant: "Athlete", position: "Midfielder", sessionsBooked: 3, lifetimeSpend: 36_000, videoStatus: "Pending", joined: "2026-05-21", email: "katla.s@gmail.com", dob: "2011-09-03", minor: true },
  { id: "pl-007", name: "Mikael Egill", tier: "Advanced", variant: "Athlete", position: "Striker", sessionsBooked: 27, lifetimeSpend: 351_000, videoStatus: "Verified", joined: "2025-10-30", email: "mikael.e@gmail.com", dob: "2006-02-12", minor: false, club: "Stjarnan" },
  { id: "pl-008", name: "Sóley Margrét", tier: "Intermediate", variant: "Athlete", position: "Defender", sessionsBooked: 11, lifetimeSpend: 132_000, videoStatus: "Not started", joined: "2026-01-27", email: "soley.m@gmail.com", dob: "2010-12-01", minor: true, club: "Valur" },
];

// ---- Clubs ----------------------------------------------------------------
export interface Club {
  id: string;
  name: string;
  tier: "Junior" | "Senior" | "Academy";
  squads: number;
  activeBookings: number;
  monthlySpend: number;
  lifetimeSpend: number;
  status: "Active" | "Pending" | "Suspended";
  joined: string;
  vskNumber: string;
  billingEmail: string;
  region: string;
  appliedAt?: string;
  established: number;
}
export const clubs: Club[] = [
  { id: "cl-001", name: "Knattspyrnufélagið Valur", tier: "Academy", squads: 8, activeBookings: 14, monthlySpend: 1_240_000, lifetimeSpend: 12_900_000, status: "Active", joined: "2025-08-15", vskNumber: "VSK 540273-0249", billingEmail: "billing@valur.is", region: "Reykjavík", established: 1911 },
  { id: "cl-002", name: "Breiðablik UBK", tier: "Academy", squads: 7, activeBookings: 11, monthlySpend: 980_000, lifetimeSpend: 9_300_000, status: "Active", joined: "2025-09-02", vskNumber: "VSK 600169-2989", billingEmail: "skrifstofa@breidablik.is", region: "Kópavogur", established: 1950 },
  { id: "cl-003", name: "Knattspyrnufélag Reykjavíkur", tier: "Senior", squads: 5, activeBookings: 7, monthlySpend: 560_000, lifetimeSpend: 4_100_000, status: "Active", joined: "2025-10-18", vskNumber: "VSK 470169-3399", billingEmail: "kr@kr.is", region: "Reykjavík", established: 1899 },
  { id: "cl-004", name: "Fimleikafélag Hafnarfjarðar", tier: "Senior", squads: 4, activeBookings: 3, monthlySpend: 320_000, lifetimeSpend: 2_010_000, status: "Active", joined: "2026-01-12", vskNumber: "VSK 690171-0119", billingEmail: "fh@fh.is", region: "Hafnarfjörður", established: 1929 },
  { id: "cl-005", name: "Ungmennafélag Stjarnan", tier: "Junior", squads: 3, activeBookings: 2, monthlySpend: 180_000, lifetimeSpend: 540_000, status: "Pending", joined: "2026-06-23", appliedAt: "2026-06-23T11:20:00Z", vskNumber: "VSK 560283-2019", billingEmail: "stjarnan@stjarnan.is", region: "Garðabær", established: 1960 },
  { id: "cl-006", name: "Íþróttabandalag Akraness", tier: "Junior", squads: 2, activeBookings: 0, monthlySpend: 0, lifetimeSpend: 96_000, status: "Pending", joined: "2026-06-20", appliedAt: "2026-06-20T15:55:00Z", vskNumber: "VSK 470269-4429", billingEmail: "ia@ia.is", region: "Akranes", established: 1946 },
  { id: "cl-007", name: "Knattspyrnufélagið Víkingur", tier: "Senior", squads: 4, activeBookings: 5, monthlySpend: 410_000, lifetimeSpend: 3_220_000, status: "Suspended", joined: "2025-11-05", vskNumber: "VSK 600169-7789", billingEmail: "vikingur@vikingur.is", region: "Reykjavík", established: 1908 },
];

// ---- Approvals queue ------------------------------------------------------
export interface ApprovalItem {
  id: string;
  applicant: string;
  refId: string; // coach/club id
  persona: Persona;
  kind: "Coach L1" | "Club L1" | "Tier L2" | "Player Video";
  submittedAt: string;
  selfTier: string;
  requestedTier?: string;
  reviewer?: string;
  status: "Applied" | "In Review" | "Awaiting info";
}
export const approvalQueue: ApprovalItem[] = [
  { id: "ap-01", applicant: "Dagný Brynjars", refId: "co-007", persona: "coach", kind: "Coach L1", submittedAt: "2026-06-22T08:05:00Z", selfTier: "Grassroots", status: "Applied" },
  { id: "ap-02", applicant: "Hólmar Örn Eyjólfs", refId: "co-006", persona: "coach", kind: "Coach L1", submittedAt: "2026-06-24T14:40:00Z", selfTier: "Local", reviewer: "Sigrún H.", status: "In Review" },
  { id: "ap-03", applicant: "Gylfi Þór Sigurðs", refId: "co-005", persona: "coach", kind: "Coach L1", submittedAt: "2026-06-26T09:10:00Z", selfTier: "Pro", status: "Applied" },
  { id: "ap-04", applicant: "Ungmennafélag Stjarnan", refId: "cl-005", persona: "club", kind: "Club L1", submittedAt: "2026-06-23T11:20:00Z", selfTier: "Junior", reviewer: "Sigrún H.", status: "In Review" },
  { id: "ap-05", applicant: "Íþróttabandalag Akraness", refId: "cl-006", persona: "club", kind: "Club L1", submittedAt: "2026-06-20T15:55:00Z", selfTier: "Junior", status: "Awaiting info" },
  { id: "ap-06", applicant: "Aron Einar Pálsson", refId: "co-002", persona: "coach", kind: "Tier L2", submittedAt: "2026-06-25T10:30:00Z", selfTier: "Pro", requestedTier: "Marquee", status: "Applied" },
  { id: "ap-07", applicant: "Fimleikafélag Hafnarfjarðar", refId: "cl-004", persona: "club", kind: "Tier L2", submittedAt: "2026-06-19T09:00:00Z", selfTier: "Senior", requestedTier: "Academy", reviewer: "Sigrún H.", status: "In Review" },
  { id: "ap-08", applicant: "Emilía Rós", refId: "pl-002", persona: "player", kind: "Player Video", submittedAt: "2026-06-27T16:12:00Z", selfTier: "Intermediate", status: "Applied" },
  { id: "ap-09", applicant: "Katla Sól", refId: "pl-006", persona: "player", kind: "Player Video", submittedAt: "2026-06-21T13:45:00Z", selfTier: "Beginner", status: "Applied" },
];

// ---- Bookings -------------------------------------------------------------
export interface Booking {
  id: string;
  when: string;
  coaches: string[];
  buyerType: Persona;
  buyer: string;
  type: SessionType;
  status: "Upcoming" | "Completed" | "Cancelled" | "Disputed";
  amount: number;
  payoutState: "Awaiting release" | "Released" | "Held" | "Blocked" | "-";
  hybrid?: { remote: string; local: string };
}
export const bookings: Booking[] = [
  { id: "BK-20416", when: "2026-06-29T17:00:00Z", coaches: ["Eiður Smárason"], buyerType: "player", buyer: "Viktor Andri", type: "F2F", status: "Upcoming", amount: 18_000, payoutState: "-" },
  { id: "BK-20417", when: "2026-06-28T15:30:00Z", coaches: ["Sara Björk Gunn"], buyerType: "player", buyer: "Hekla Dögg", type: "Online", status: "Completed", amount: 12_000, payoutState: "Awaiting release" },
  { id: "BK-20418", when: "2026-06-28T18:00:00Z", coaches: ["Eiður Smárason", "Birkir Bjarnason"], buyerType: "club", buyer: "Knattspyrnufélagið Valur", type: "Hybrid", status: "Completed", amount: 46_000, payoutState: "Awaiting release", hybrid: { remote: "Eiður Smárason", local: "Birkir Bjarnason" } },
  { id: "BK-20419", when: "2026-06-27T16:00:00Z", coaches: ["Margrét Lára Jóns"], buyerType: "player", buyer: "Aron Daði", type: "Online", status: "Disputed", amount: 12_000, payoutState: "Held" },
  { id: "BK-20420", when: "2026-06-27T19:00:00Z", coaches: ["Aron Einar Pálsson"], buyerType: "club", buyer: "Breiðablik UBK", type: "F2F", status: "Completed", amount: 32_000, payoutState: "Released" },
  { id: "BK-20421", when: "2026-06-26T17:30:00Z", coaches: ["Sara Björk Gunn", "Kolbeinn Sigþórs"], buyerType: "club", buyer: "Knattspyrnufélag Reykjavíkur", type: "Hybrid", status: "Completed", amount: 52_000, payoutState: "Awaiting release", hybrid: { remote: "Sara Björk Gunn", local: "Kolbeinn Sigþórs" } },
  { id: "BK-20422", when: "2026-06-30T14:00:00Z", coaches: ["Margrét Lára Jóns"], buyerType: "player", buyer: "Mikael Egill", type: "Online", status: "Upcoming", amount: 12_000, payoutState: "-" },
  { id: "BK-20423", when: "2026-06-25T20:00:00Z", coaches: ["Eiður Smárason"], buyerType: "player", buyer: "Emilía Rós", type: "F2F", status: "Cancelled", amount: 18_000, payoutState: "-" },
  { id: "BK-20424", when: "2026-06-25T16:00:00Z", coaches: ["Aron Einar Pálsson"], buyerType: "club", buyer: "Fimleikafélag Hafnarfjarðar", type: "F2F", status: "Completed", amount: 32_000, payoutState: "Released" },
  { id: "BK-20425", when: "2026-06-24T18:30:00Z", coaches: ["Sara Björk Gunn"], buyerType: "player", buyer: "Hekla Dögg", type: "Online", status: "Completed", amount: 12_000, payoutState: "Blocked" },
];

// ---- Payouts (dual-leg for hybrids) --------------------------------------
export interface Payout {
  id: string;
  payee: string;
  bookingId: string;
  gross: number;
  sessionType: SessionType;
  completedAt: string;
  state: "Awaiting release" | "Released" | "Held" | "Blocked";
  leg?: "Remote" | "Local";
  account: string;
  flags?: string[];
}
function p(id: string, payee: string, bookingId: string, gross: number, sessionType: SessionType, completedAt: string, state: Payout["state"], account: string, leg?: Payout["leg"], flags?: string[]): Payout {
  return { id, payee, bookingId, gross, sessionType, completedAt, state, account, leg, flags };
}
export const payouts: Payout[] = [
  p("PO-5012", "Sara Björk Gunn", "BK-20417", 12_000, "Online", "2026-06-28T16:30:00Z", "Awaiting release", "0133-26-553311"),
  p("PO-5013", "Eiður Smárason", "BK-20418", 27_000, "Hybrid", "2026-06-28T19:00:00Z", "Awaiting release", "0133-26-004182", "Remote"),
  p("PO-5014", "Birkir Bjarnason", "BK-20418", 19_000, "Hybrid", "2026-06-28T19:00:00Z", "Awaiting release", "0708-19-553021", "Local"),
  p("PO-5015", "Aron Einar Pálsson", "BK-20420", 32_000, "F2F", "2026-06-27T20:00:00Z", "Released", "0526-14-771203"),
  p("PO-5016", "Sara Björk Gunn", "BK-20421", 30_000, "Hybrid", "2026-06-26T18:30:00Z", "Awaiting release", "0133-26-553311", "Remote", ["Unusually large amount"]),
  p("PO-5017", "Kolbeinn Sigþórs", "BK-20421", 22_000, "Hybrid", "2026-06-26T18:30:00Z", "Held", "0712-33-884412", "Local"),
  p("PO-5018", "Margrét Lára Jóns", "BK-20419", 12_000, "Online", "2026-06-27T17:00:00Z", "Held", "0301-22-118890", undefined, ["Linked to open dispute"]),
  p("PO-5019", "Aron Einar Pálsson", "BK-20424", 32_000, "F2F", "2026-06-25T17:00:00Z", "Released", "0526-14-771203"),
  p("PO-5020", "Sara Björk Gunn", "BK-20425", 12_000, "Online", "2026-06-24T19:30:00Z", "Blocked", "0133-26-553311", undefined, ["Blocked - dispute DC-3007"]),
  p("PO-5021", "Eiður Smárason", "BK-20416", 18_000, "F2F", "2026-06-29T09:45:00Z", "Awaiting release", "0133-26-004182", undefined, ["First payout this cycle"]),
];

// ---- Transactions ledger --------------------------------------------------
export interface Txn {
  id: string;
  date: string;
  type: "Charge" | "Platform fee" | "VAT (VSK)" | "Payout" | "Refund";
  counterparty: string;
  gross: number;
  fee: number;
  vatAmt: number;
  net: number;
  linked: string;
  method: "Card" | "Bank transfer";
}
export const transactions: Txn[] = [
  { id: "TX-88231", date: "2026-06-28T16:30:00Z", type: "Charge", counterparty: "Hekla Dögg", gross: 12_000, fee: 2_400, vatAmt: 2_323, net: 12_000, linked: "BK-20417", method: "Card" },
  { id: "TX-88232", date: "2026-06-28T19:00:00Z", type: "Charge", counterparty: "Knattspyrnufélagið Valur", gross: 46_000, fee: 9_200, vatAmt: 8_903, net: 46_000, linked: "BK-20418", method: "Bank transfer" },
  { id: "TX-88233", date: "2026-06-27T20:05:00Z", type: "Payout", counterparty: "Aron Einar Pálsson", gross: 32_000, fee: 6_400, vatAmt: 0, net: 25_600, linked: "PO-5015", method: "Bank transfer" },
  { id: "TX-88234", date: "2026-06-27T17:00:00Z", type: "Charge", counterparty: "Aron Daði", gross: 12_000, fee: 2_400, vatAmt: 2_323, net: 12_000, linked: "BK-20419", method: "Card" },
  { id: "TX-88235", date: "2026-06-26T18:30:00Z", type: "Charge", counterparty: "Knattspyrnufélag Reykjavíkur", gross: 52_000, fee: 10_400, vatAmt: 10_065, net: 52_000, linked: "BK-20421", method: "Bank transfer" },
  { id: "TX-88236", date: "2026-06-25T17:05:00Z", type: "Payout", counterparty: "Aron Einar Pálsson", gross: 32_000, fee: 6_400, vatAmt: 0, net: 25_600, linked: "PO-5019", method: "Bank transfer" },
  { id: "TX-88237", date: "2026-06-24T12:00:00Z", type: "Refund", counterparty: "Stefán Logi", gross: 18_000, fee: -3_600, vatAmt: -3_484, net: -18_000, linked: "DC-3005", method: "Card" },
  { id: "TX-88238", date: "2026-06-23T09:30:00Z", type: "VAT (VSK)", counterparty: "Skatturinn (VSK remittance)", gross: 0, fee: 0, vatAmt: 184_200, net: -184_200, linked: "VSK-2026-05", method: "Bank transfer" },
];

// ---- Invoices -------------------------------------------------------------
export interface Invoice {
  id: string;
  number: string;
  kind: "Tax invoice" | "Payout statement";
  recipient: string;
  date: string;
  amount: number;
  vatAmt: number;
  status: "Draft" | "Issued" | "Paid";
}
export const invoices: Invoice[] = [
  { id: "iv-1", number: "VSK-2026-0412", kind: "Tax invoice", recipient: "Knattspyrnufélagið Valur", date: "2026-06-28", amount: 46_000, vatAmt: 8_903, status: "Issued" },
  { id: "iv-2", number: "VSK-2026-0413", kind: "Tax invoice", recipient: "Knattspyrnufélag Reykjavíkur", date: "2026-06-26", amount: 52_000, vatAmt: 10_065, status: "Paid" },
  { id: "iv-3", number: "PS-2026-1188", kind: "Payout statement", recipient: "Aron Einar Pálsson", date: "2026-06-27", amount: 25_600, vatAmt: 0, status: "Issued" },
  { id: "iv-4", number: "PS-2026-1189", kind: "Payout statement", recipient: "Aron Einar Pálsson", date: "2026-06-25", amount: 25_600, vatAmt: 0, status: "Paid" },
  { id: "iv-5", number: "VSK-2026-0414", kind: "Tax invoice", recipient: "Breiðablik UBK", date: "2026-06-29", amount: 32_000, vatAmt: 6_194, status: "Draft" },
];

// ---- Refunds & disputes ---------------------------------------------------
export interface Dispute {
  id: string;
  bookingId: string;
  raisedBy: string;
  raisedByPersona: Persona;
  reason: string;
  amount: number;
  payoutState: "Held" | "Blocked" | "-";
  status: "Open" | "Holding" | "Resolved";
  openedAt: string;
}
export const disputes: Dispute[] = [
  { id: "DC-3007", bookingId: "BK-20419", raisedBy: "Aron Daði", raisedByPersona: "player", reason: "Coach no-show for online session", amount: 12_000, payoutState: "Held", status: "Open", openedAt: "2026-06-27T18:00:00Z" },
  { id: "DC-3006", bookingId: "BK-20425", raisedBy: "Hekla Dögg", raisedByPersona: "player", reason: "Session quality below expectation", amount: 12_000, payoutState: "Blocked", status: "Holding", openedAt: "2026-06-25T10:00:00Z" },
  { id: "DC-3005", bookingId: "BK-20423", raisedBy: "Emilía Rós", raisedByPersona: "player", reason: "Cancelled within policy window", amount: 18_000, payoutState: "-", status: "Resolved", openedAt: "2026-06-24T09:00:00Z" },
];

// ---- Support tickets ------------------------------------------------------
export interface TicketMsg { from: string; internal?: boolean; at: string; body: string; }
export interface Ticket {
  id: string;
  requester: string;
  persona: Persona;
  subject: string;
  openedAt: string;
  assignee?: string;
  status: "New" | "Open" | "Waiting" | "Resolved";
  priority: "Low" | "Normal" | "High" | "Urgent";
  messages: TicketMsg[];
}
export const tickets: Ticket[] = [
  { id: "TK-771", requester: "Aron Daði", persona: "player", subject: "Refund for no-show session", openedAt: "2026-06-27T18:05:00Z", status: "Open", priority: "High", assignee: "Sigrún H.", messages: [{ from: "Aron Daði", at: "2026-06-27T18:05:00Z", body: "My coach didn't show up for the online session BK-20419. I'd like a refund." }, { from: "Sigrún H.", internal: true, at: "2026-06-27T18:20:00Z", body: "Confirmed no VC join logged. Escalating to dispute DC-3007." }] },
  { id: "TK-772", requester: "Knattspyrnufélagið Valur", persona: "club", subject: "Reissue invoice with updated VSK number", openedAt: "2026-06-28T09:40:00Z", status: "Waiting", priority: "Normal", assignee: "Sigrún H.", messages: [{ from: "Valur (billing)", at: "2026-06-28T09:40:00Z", body: "Please reissue VSK-2026-0412 with our new registration number." }] },
  { id: "TK-773", requester: "Gylfi Þór Sigurðs", persona: "coach", subject: "How long does coach approval take?", openedAt: "2026-06-28T12:15:00Z", status: "New", priority: "Low", messages: [{ from: "Gylfi Þór Sigurðs", at: "2026-06-28T12:15:00Z", body: "I applied two days ago - when can I expect a decision?" }] },
  { id: "TK-770", requester: "Hekla Dögg", persona: "player", subject: "Cannot access purchased package", openedAt: "2026-06-26T20:00:00Z", status: "Resolved", priority: "Normal", assignee: "Sigrún H.", messages: [{ from: "Hekla Dögg", at: "2026-06-26T20:00:00Z", body: "My package disappeared from my account." }, { from: "Sigrún H.", at: "2026-06-26T20:30:00Z", body: "Restored - caching issue on our side. Sorry for the trouble!" }] },
];

// ---- Decision log ---------------------------------------------------------
export interface Decision {
  id: string;
  when: string;
  decidedBy: string;
  subject: string;
  persona: Persona;
  kind: string;
  decision: "Approved" | "Rejected" | "Info requested";
  reason: string;
  tierChange?: string;
}
export const decisions: Decision[] = [
  { id: "d-1", when: "2026-06-28T10:12:00Z", decidedBy: "Sigrún H.", subject: "Margrét Lára Jóns", persona: "coach", kind: "Coach L1", decision: "Approved", reason: "Credentials verified; GK diploma confirmed.", tierChange: "→ Pro" },
  { id: "d-2", when: "2026-06-27T15:40:00Z", decidedBy: "Sigrún H.", subject: "Breiðablik UBK", persona: "club", kind: "Tier L2", decision: "Approved", reason: "Spend + squad volume meets Academy criteria.", tierChange: "Senior → Academy" },
  { id: "d-3", when: "2026-06-27T09:05:00Z", decidedBy: "Sigrún H.", subject: "Kolbeinn Sigþórs", persona: "coach", kind: "Coach L1", decision: "Approved", reason: "UEFA B verified.", tierChange: "→ Local" },
  { id: "d-4", when: "2026-06-26T14:22:00Z", decidedBy: "Sigrún H.", subject: "Rúrik Gíslason", persona: "coach", kind: "Tier L2", decision: "Rejected", reason: "Rating dipped below Marquee threshold this quarter." },
  { id: "d-5", when: "2026-06-25T11:00:00Z", decidedBy: "Sigrún H.", subject: "Hekla Dögg", persona: "player", kind: "Player Video", decision: "Approved", reason: "Skill clips verified.", tierChange: "Verified badge" },
  { id: "d-6", when: "2026-06-24T16:30:00Z", decidedBy: "Sigrún H.", subject: "Íþróttabandalag Akraness", persona: "club", kind: "Club L1", decision: "Info requested", reason: "Need registration proof + VSK number." },
];

// ---- Audit log ------------------------------------------------------------
export interface AuditEntry {
  id: string;
  when: string;
  actor: string;
  action: string;
  target: string;
  before: string;
  after: string;
  reason: string;
  module: string;
}
export const auditLog: AuditEntry[] = [
  { id: "a-1", when: "2026-06-29T09:42:00Z", actor: "Sigrún H.", action: "Sign-in", target: "Console", before: "-", after: "Session opened", reason: "TOTP verified · trusted device", module: "Auth" },
  { id: "a-2", when: "2026-06-28T19:10:00Z", actor: "Jón Ólafsson", action: "Payout released", target: "PO-5015", before: "Awaiting release", after: "Released", reason: "Session completed, no dispute", module: "Finance" },
  { id: "a-3", when: "2026-06-28T10:12:00Z", actor: "Sigrún H.", action: "Coach approved", target: "co-003 Margrét Lára Jóns", before: "Pending", after: "Active · Pro", reason: "Credentials verified", module: "Approvals" },
  { id: "a-4", when: "2026-06-27T18:20:00Z", actor: "Sigrún H.", action: "Dispute opened", target: "DC-3007", before: "-", after: "Open", reason: "Coach no-show, escalated from TK-771", module: "Finance" },
  { id: "a-5", when: "2026-06-27T15:40:00Z", actor: "Sigrún H.", action: "Tier changed", target: "cl-002 Breiðablik UBK", before: "Senior", after: "Academy", reason: "Meets Academy criteria", module: "Approvals" },
  { id: "a-6", when: "2026-06-26T08:00:00Z", actor: "Sigrún H.", action: "Coach suspended", target: "co-008 Rúrik Gíslason", before: "Active", after: "Suspended", reason: "Conduct review pending", module: "Users" },
  { id: "a-7", when: "2026-06-25T13:15:00Z", actor: "Sigrún H.", action: "Config edited", target: "Platform fee", before: "-", after: "20% (unchanged)", reason: "Reviewed quarterly", module: "Config" },
];

// ---- Admin users ----------------------------------------------------------
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Suspended";
  lastSignIn: string;
}
export const adminUsers: AdminUser[] = [
  { id: "au-1", name: "Sigrún Halldórsdóttir", email: "sigrun@valur.is", role: "Super Admin", status: "Active", lastSignIn: "2026-06-29T09:42:00Z" },
  { id: "au-2", name: "Jón Ólafsson", email: "jon@valur.is", role: "Finance", status: "Active", lastSignIn: "2026-06-28T19:30:00Z" },
  { id: "au-3", name: "Anna Kristín", email: "anna@valur.is", role: "Operations", status: "Active", lastSignIn: "2026-06-29T08:15:00Z" },
  { id: "au-4", name: "Pétur Már", email: "petur@valur.is", role: "Support", status: "Active", lastSignIn: "2026-06-28T17:05:00Z" },
  { id: "au-5", name: "Helga Rún", email: "helga@valur.is", role: "Content Moderator", status: "Active", lastSignIn: "2026-06-27T11:20:00Z" },
  { id: "au-6", name: "Ósk Þórðar", email: "osk@valur.is", role: "Read-only Analyst", status: "Suspended", lastSignIn: "2026-06-10T14:00:00Z" },
];

// ---- Package templates ----------------------------------------------------
export interface PackageTemplate {
  id: string;
  name: string;
  players: 4 | 6 | 10;
  services: string[];
  sessions: number;
  duration: string;
  price: number;
  delivery: SessionType;
}
export const packageTemplates: PackageTemplate[] = [
  { id: "pk-1", name: "Squad Strength Block", players: 6, services: ["Strength", "Nutrition"], sessions: 12, duration: "6 weeks", price: 540_000, delivery: "F2F" },
  { id: "pk-2", name: "Elite Finishing Online", players: 4, services: ["Finishing", "Video review"], sessions: 8, duration: "4 weeks", price: 320_000, delivery: "Online" },
  { id: "pk-3", name: "Academy Hybrid Programme", players: 10, services: ["Running", "Strength", "Sports psychology"], sessions: 20, duration: "10 weeks", price: 1_280_000, delivery: "Hybrid" },
  { id: "pk-4", name: "Goalkeeper Intensive", players: 4, services: ["Goalkeeping", "Distribution"], sessions: 10, duration: "5 weeks", price: 410_000, delivery: "F2F" },
];

// ---- Lectures -------------------------------------------------------------
export interface Lecture {
  id: string;
  title: string;
  speaker: string;
  speakerTier: string;
  when: string;
  format: "Online" | "In person";
  capacity: number;
  registered: number;
  price: number;
  status: "Draft" | "Live" | "Unpublished";
  origin: "Platform" | "Coach" | "Club";
  joinUrl?: string;
  location?: string;
}
export const lectures: Lecture[] = [
  { id: "lc-1", title: "Periodisation for youth squads", speaker: "Sara Björk Gunn", speakerTier: "Marquee", when: "2026-07-08T17:00:00Z", format: "Online", capacity: 200, registered: 142, price: 4_900, status: "Live", origin: "Platform", joinUrl: "https://meet.valur.is/periodisation-youth" },
  { id: "lc-2", title: "Set-piece design workshop", speaker: "Aron Einar Pálsson", speakerTier: "Pro", when: "2026-07-15T18:00:00Z", format: "In person", capacity: 40, registered: 31, price: 9_900, status: "Live", origin: "Coach", location: "Valur Clubhouse, Hlíðarendi, Reykjavík" },
  { id: "lc-3", title: "Nutrition for match week", speaker: "Dr. Helga Rún", speakerTier: "-", when: "2026-07-22T16:30:00Z", format: "Online", capacity: 300, registered: 0, price: 0, status: "Draft", origin: "Platform", joinUrl: "https://meet.valur.is/nutrition-match-week" },
  { id: "lc-4", title: "Building an academy culture", speaker: "Valur Academy", speakerTier: "Academy", when: "2026-06-30T17:00:00Z", format: "In person", capacity: 60, registered: 58, price: 6_900, status: "Unpublished", origin: "Club", location: "Valur Academy Hall, Hlíðarendi, Reykjavík" },
];

// ---- Taxonomy -------------------------------------------------------------
export const taxonomy: { group: string; terms: string[] }[] = [
  { group: "Specialties", terms: ["Finishing", "Midfield control", "Goalkeeping", "Defending", "Set pieces", "Wing play", "Playmaking", "Hold-up play"] },
  { group: "Age groups", terms: ["U8", "U10", "U12", "U14", "U16", "U19", "Senior"] },
  { group: "Coaching audiences", terms: ["Individual athletes", "Squads", "Goalkeepers", "Coaches (learning)"] },
  { group: "Positions", terms: ["Goalkeeper", "Defender", "Midfielder", "Winger", "Striker"] },
  { group: "Resource topics", terms: ["Tactics", "Strength", "Nutrition", "Sports psychology", "Recovery"] },
];

// ---- Platform settings ----------------------------------------------------
export const platformSettings = {
  feePct: 20,
  currency: "ISK",
  vskStandard: 24,
  vskReduced: 11,
  payoutCycle: "Weekly (Fridays)",
  rails: ["Card", "Bank transfer", "Pay by invoice (clubs)"],
  sessionTypes: ["F2F", "Online", "Hybrid"],
  languages: ["English", "Íslenska"],
  cancellationWindowHrs: 24,
  refundWindowHrs: 48,
  featureFlags: [
    { key: "auto_release_payouts", label: "Auto-release low-risk payouts", on: false, note: "P2 - queue becomes exception list" },
    { key: "bulk_approvals", label: "Bulk approval actions", on: false, note: "P2 - once manual gate is proven" },
    { key: "intercom", label: "Intercom ticketing", on: false, note: "P2 - behind thin support interface" },
  ],
};

// ---- Dashboard aggregates -------------------------------------------------
export const dashboard = {
  actionQueue: [
    { key: "coaches", label: "Coaches awaiting approval", count: 3, to: "/admin/approvals", tone: "coach" as const },
    { key: "clubs", label: "Clubs awaiting approval", count: 2, to: "/admin/approvals", tone: "club" as const },
    { key: "tiers", label: "Tier-upgrade requests", count: 2, to: "/admin/approvals", tone: "system" as const },
    { key: "payouts", label: "Payouts awaiting release", count: 5, to: "/admin/finance/payouts", tone: "system" as const },
    { key: "held", label: "Held / disputed payments", count: 3, to: "/admin/finance/disputes", tone: "system" as const },
    { key: "tickets", label: "Open tickets", count: 3, to: "/admin/support", tone: "system" as const },
  ],
  kpis: {
    gmv: 4_980_000,
    revenue: 996_000,
    vsk: 184_200,
    payoutsReleased: 51_200,
    payoutsPending: 121_000,
    activeCoaches: 7,
    activePlayers: 6,
    activeClubs: 4,
    sessionsBooked: 42,
    sessionsCompleted: 31,
    deltas: { gmv: 12.4, revenue: 12.4, vsk: 8.1, sessions: -3.2 },
  },
  // time series (last 14 days) - bookings + revenue
  series: [
    { d: "16 Jun", bookings: 4, revenue: 92 }, { d: "17 Jun", bookings: 6, revenue: 138 },
    { d: "18 Jun", bookings: 5, revenue: 110 }, { d: "19 Jun", bookings: 7, revenue: 176 },
    { d: "20 Jun", bookings: 3, revenue: 64 }, { d: "21 Jun", bookings: 8, revenue: 204 },
    { d: "22 Jun", bookings: 6, revenue: 150 }, { d: "23 Jun", bookings: 9, revenue: 232 },
    { d: "24 Jun", bookings: 7, revenue: 168 }, { d: "25 Jun", bookings: 10, revenue: 268 },
    { d: "26 Jun", bookings: 8, revenue: 212 }, { d: "27 Jun", bookings: 11, revenue: 296 },
    { d: "28 Jun", bookings: 9, revenue: 246 }, { d: "29 Jun", bookings: 5, revenue: 132 },
  ],
  sessionMix: [
    { type: "F2F", value: 18 },
    { type: "Online", value: 15 },
    { type: "Hybrid", value: 9 },
  ],
  approvalBacklog: [
    { d: "23 Jun", processed: 3, backlog: 11 }, { d: "24 Jun", processed: 4, backlog: 9 },
    { d: "25 Jun", processed: 5, backlog: 8 }, { d: "26 Jun", processed: 2, backlog: 9 },
    { d: "27 Jun", processed: 4, backlog: 8 }, { d: "28 Jun", processed: 3, backlog: 7 },
    { d: "29 Jun", processed: 1, backlog: 7 },
  ],
  recent: [
    { at: "2026-06-29T09:42:00Z", icon: "signin", text: "Sigrún H. signed in", tone: "system" as const },
    { at: "2026-06-28T19:10:00Z", icon: "payout", text: "Payout PO-5015 released to Aron Einar Pálsson", tone: "system" as const },
    { at: "2026-06-28T10:12:00Z", icon: "approval", text: "Coach Margrét Lára Jóns approved (Pro)", tone: "coach" as const },
    { at: "2026-06-27T18:20:00Z", icon: "dispute", text: "Dispute DC-3007 opened on BK-20419", tone: "club" as const },
    { at: "2026-06-27T15:40:00Z", icon: "tier", text: "Breiðablik UBK upgraded Senior → Academy", tone: "club" as const },
  ],
  pinned: [
    { text: "Payout PO-5017 held > 5 days - review", to: "/admin/finance/payouts" },
    { text: "Club Akranes onboarding awaiting info since 20 Jun", to: "/admin/approvals" },
  ],
};

export const badgeCounts = { approvals: 9, payouts: 5, disputes: 2, tickets: 3 };

// ---- lookup helpers --------------------------------------------------------
export const findCoach = (id: string) => coaches.find((c) => c.id === id);
export const findPlayer = (id: string) => players.find((p) => p.id === id);
export const findClub = (id: string) => clubs.find((c) => c.id === id);
export const findBooking = (id: string) => bookings.find((b) => b.id === id);
export const findPayout = (id: string) => payouts.find((p) => p.id === id);
export const findTicket = (id: string) => tickets.find((t) => t.id === id);

// silence unused-import warnings for fee helpers re-exported for screens
export const _calc = { netPayout, platformFee, vsk };
