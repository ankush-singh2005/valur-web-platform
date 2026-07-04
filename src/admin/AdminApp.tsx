import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import "./styles/admin.css";

import { AdminLayout } from "./layout/AdminLayout";
import { AuthProvider, RequireAuth } from "./lib/auth";

import { Login, TwoFactor, ForgotReset } from "./pages/auth";
import { OverviewDashboard } from "./pages/dashboard";
import { ApprovalsHub, CoachReview, ClubReview, TierUpgrade, PlayerVideo, DecisionLog } from "./pages/approvals";
import { CoachesDirectory, CoachDetail, PlayersDirectory, PlayerDetail, ClubsDirectory, ClubDetail } from "./pages/users";
import { SessionsMonitor, BookingDetail } from "./pages/bookings";
import { FinanceOverview, PayoutsQueue, PayoutDetail, TransactionsLedger, Invoicing, RefundsDisputes } from "./pages/finance";
import { TicketsList, TicketDetail } from "./pages/support";
import { TierCriteria, Taxonomy, PackageTemplates, GroupLectures, PlatformSettings } from "./pages/config";
import { AdminUsersRoles, AuditLog } from "./pages/access";

export default function AdminApp() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        {/* Auth - standalone, no shell */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/2fa" element={<TwoFactor />} />
        <Route path="/admin/reset" element={<ForgotReset />} />

        {/* Console shell - gated behind sign-in */}
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<OverviewDashboard />} />

          {/* 02 · Approvals */}
          <Route path="approvals" element={<ApprovalsHub />} />
          <Route path="approvals/decisions" element={<DecisionLog />} />
          <Route path="approvals/coach/:id" element={<CoachReview />} />
          <Route path="approvals/club/:id" element={<ClubReview />} />
          <Route path="approvals/tier/:id" element={<TierUpgrade />} />
          <Route path="approvals/video/:id" element={<PlayerVideo />} />

          {/* 03 · Users */}
          <Route path="users/coaches" element={<CoachesDirectory />} />
          <Route path="users/coaches/:id" element={<CoachDetail />} />
          <Route path="users/players" element={<PlayersDirectory />} />
          <Route path="users/players/:id" element={<PlayerDetail />} />
          <Route path="users/clubs" element={<ClubsDirectory />} />
          <Route path="users/clubs/:id" element={<ClubDetail />} />

          {/* 04 · Bookings */}
          <Route path="bookings" element={<SessionsMonitor />} />
          <Route path="bookings/:id" element={<BookingDetail />} />

          {/* 05 · Finance */}
          <Route path="finance" element={<FinanceOverview />} />
          <Route path="finance/payouts" element={<PayoutsQueue />} />
          <Route path="finance/payouts/:id" element={<PayoutDetail />} />
          <Route path="finance/transactions" element={<TransactionsLedger />} />
          <Route path="finance/invoicing" element={<Invoicing />} />
          <Route path="finance/disputes" element={<RefundsDisputes />} />

          {/* 06 · Support */}
          <Route path="support" element={<TicketsList />} />
          <Route path="support/:id" element={<TicketDetail />} />

          {/* 07 · Configuration */}
          <Route path="config/tiers" element={<TierCriteria />} />
          <Route path="config/taxonomy" element={<Taxonomy />} />
          <Route path="config/packages" element={<PackageTemplates />} />
          <Route path="config/lectures" element={<GroupLectures />} />
          <Route path="config/settings" element={<PlatformSettings />} />

          {/* 08 · Access & Audit */}
          <Route path="access/admins" element={<AdminUsersRoles />} />
          {/* Permissions Matrix folded into the "View the six roles" tray on Admin Users & Roles */}
          <Route path="access/permissions" element={<Navigate to="/admin/access/admins" replace />} />
          <Route path="access/audit" element={<AuditLog />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
