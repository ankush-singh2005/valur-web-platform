import {
  LayoutDashboard,
  Gavel,
  Users,
  CalendarClock,
  Wallet,
  LifeBuoy,
  SlidersHorizontal,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  screen?: string; // AD·NN reference
  end?: boolean; // exact match for NavLink
  badge?: keyof BadgeCounts;
};

export type NavGroup = {
  id: string;
  label: string;
  module: string; // "02 · Approvals"
  icon: LucideIcon;
  to: string; // primary destination
  items: NavItem[];
};

export type BadgeCounts = {
  approvals: number;
  payouts: number;
  disputes: number;
  tickets: number;
};

export const NAV: NavGroup[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    module: "01 · Dashboard",
    icon: LayoutDashboard,
    to: "/admin",
    items: [{ label: "Overview", to: "/admin", screen: "AD·04", end: true }],
  },
  {
    id: "approvals",
    label: "Approvals",
    module: "02 · Approvals",
    icon: Gavel,
    to: "/admin/approvals",
    items: [
      { label: "Approvals Hub", to: "/admin/approvals", screen: "AD·05", end: true, badge: "approvals" },
      { label: "Decision Log", to: "/admin/approvals/decisions", screen: "AD·10" },
    ],
  },
  {
    id: "users",
    label: "Users",
    module: "03 · Users",
    icon: Users,
    to: "/admin/users/coaches",
    items: [
      { label: "Coaches", to: "/admin/users/coaches", screen: "AD·11" },
      { label: "Players", to: "/admin/users/players", screen: "AD·13" },
      { label: "Clubs", to: "/admin/users/clubs", screen: "AD·15" },
    ],
  },
  {
    id: "bookings",
    label: "Bookings",
    module: "04 · Bookings & Sessions",
    icon: CalendarClock,
    to: "/admin/bookings",
    items: [{ label: "Sessions Monitor", to: "/admin/bookings", screen: "AD·17", end: true }],
  },
  {
    id: "finance",
    label: "Finance",
    module: "05 · Finance",
    icon: Wallet,
    to: "/admin/finance",
    items: [
      { label: "Overview", to: "/admin/finance", screen: "AD·19", end: true },
      { label: "Payouts Queue", to: "/admin/finance/payouts", screen: "AD·20", badge: "payouts" },
      { label: "Transactions", to: "/admin/finance/transactions", screen: "AD·22" },
      { label: "Invoicing", to: "/admin/finance/invoicing", screen: "AD·23" },
      { label: "Refunds & Disputes", to: "/admin/finance/disputes", screen: "AD·24", badge: "disputes" },
    ],
  },
  {
    id: "support",
    label: "Support",
    module: "06 · Support",
    icon: LifeBuoy,
    to: "/admin/support",
    items: [{ label: "Tickets", to: "/admin/support", screen: "AD·25", end: true, badge: "tickets" }],
  },
  {
    id: "config",
    label: "Configuration",
    module: "07 · Configuration",
    icon: SlidersHorizontal,
    to: "/admin/config/tiers",
    items: [
      { label: "Tier Criteria", to: "/admin/config/tiers", screen: "AD·27" },
      { label: "Taxonomy", to: "/admin/config/taxonomy", screen: "AD·28" },
      { label: "Package Templates", to: "/admin/config/packages", screen: "AD·29" },
      { label: "Group Lectures", to: "/admin/config/lectures", screen: "AD·30" },
      { label: "Platform Settings", to: "/admin/config/settings", screen: "AD·31" },
    ],
  },
  {
    id: "access",
    label: "Access & Audit",
    module: "08 · Access & Audit",
    icon: ShieldCheck,
    to: "/admin/access/admins",
    items: [
      { label: "Admin Users & Roles", to: "/admin/access/admins", screen: "AD·32" },
      { label: "Audit Log", to: "/admin/access/audit", screen: "AD·34" },
    ],
  },
];
