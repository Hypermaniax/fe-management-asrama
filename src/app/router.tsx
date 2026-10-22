import { createBrowserRouter, Navigate } from 'react-router'

import { RequireAuth } from '@/components/shared/require-auth'
import { PermissionGate } from '@/components/shared/permission-gate'
import { AppLayout } from '@/layouts/app-layout'
import { AuthLayout } from '@/layouts/auth-layout'
import { PublicLayout } from '@/layouts/public-layout'
import AppPlaceholderPage from '@/routes/app/placeholder'
import DashboardPage from '@/routes/app/dashboard'
import LoginPage from '@/features/auth/pages/login'
import RegisterPage from '@/features/auth/pages/register'
import VerifyOtpPage from '@/features/auth/pages/verify-otp'
import BuildingsPage from '@/features/building/pages/buildings'
import CashAccountsPage from '@/features/cash-account/pages/cash-accounts'
import CategoriesPage from '@/features/category/pages/categories'
import DocumentsPage from '@/features/document/pages/documents'
import MyDocumentsPage from '@/features/document/pages/my-documents'
import FeeRulesPage from '@/features/fee-rule/pages/fee-rules'
import RoomFacilitiesPage from '@/features/facility/pages/room-facilities'
import InvoicesPage from '@/features/invoice/pages/invoices'
import MyInvoicesPage from '@/features/invoice/pages/my-invoices'
import ExpensesPage from '@/features/expense/pages/expenses'
import ElectionsPage from '@/features/election/pages/elections'
import ElectionDetailPage from '@/features/election/pages/election-detail'
import ElectionResultsPage from '@/features/election/pages/election-results'
import MyElectionsPage from '@/features/election/pages/my-elections'
import EventDetailPage from '@/features/event/pages/event-detail'
import EventsPage from '@/features/event/pages/events'
import MyAttendancePage from '@/features/event/pages/my-attendance'
import MyPaymentsPage from '@/features/payment/pages/my-payments'
import PaymentsPage from '@/features/payment/pages/payments'
import ReportsPage from '@/features/report/pages/reports'
import AssignmentsPage from '@/features/organization/pages/assignments'
import PeriodsPage from '@/features/organization/pages/periods'
import PositionsPage from '@/features/organization/pages/positions'
import OccupanciesPage from '@/features/occupancy/pages/occupancies'
import PublicFacilitiesPage from '@/features/public-facility/pages/public-facilities'
import ApplicantsPage from '@/features/resident/pages/applicants'
import ResidentDetailPage from '@/features/resident/pages/resident-detail'
import ResidentsPage from '@/features/resident/pages/residents'
import RoomsPage from '@/features/room/pages/rooms'
import RolesPage from '@/features/rbac/pages/roles'
import MenusPage from '@/features/rbac/pages/menus'
import PermissionsPage from '@/features/rbac/pages/permissions'
import RoleDetailPage from '@/features/rbac/pages/role-detail'
import AuditPage from '@/features/system/pages/audit'
import SystemUsersPage from '@/features/system/pages/users'
import ForbiddenPage from '@/routes/forbidden'
import NotFoundPage from '@/routes/not-found'
import HomePage from '@/routes/public/index'
import PengenalanPage from '@/routes/public/pengenalan'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'pengenalan', element: <PengenalanPage /> },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'verify-otp', element: <VerifyOtpPage /> },
    ],
  },
  {
    path: '/app',
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/app/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          {
            path: 'master/buildings',
            element: (
              <PermissionGate permission="building.READ">
                <BuildingsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'master/rooms',
            element: (
              <PermissionGate permission="room.READ">
                <RoomsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'master/room-facilities',
            element: (
              <PermissionGate permission="facility.READ">
                <RoomFacilitiesPage />
              </PermissionGate>
            ),
          },
          {
            path: 'master/public-facilities',
            element: (
              <PermissionGate permission="facility.READ">
                <PublicFacilitiesPage />
              </PermissionGate>
            ),
          },
          {
            path: 'master/fee-rules',
            element: (
              <PermissionGate permission="feeRule.READ">
                <FeeRulesPage />
              </PermissionGate>
            ),
          },
          {
            path: 'master/categories',
            element: (
              <PermissionGate permission="category.READ">
                <CategoriesPage />
              </PermissionGate>
            ),
          },
          {
            path: 'residents/applicants',
            element: (
              <PermissionGate permission="user.READ">
                <ApplicantsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'residents/documents',
            element: (
              <PermissionGate permission="document.READ">
                <DocumentsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'residents/occupancies',
            element: (
              <PermissionGate permission="occupancy.READ">
                <OccupanciesPage />
              </PermissionGate>
            ),
          },
          {
            path: 'residents',
            element: (
              <PermissionGate permission="user.READ">
                <ResidentsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'residents/:id',
            element: (
              <PermissionGate permission="user.READ">
                <ResidentDetailPage />
              </PermissionGate>
            ),
          },
          {
            path: 'organization/periods',
            element: (
              <PermissionGate permission="period.READ">
                <PeriodsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'organization/positions',
            element: (
              <PermissionGate permission="position.READ">
                <PositionsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'organization/assignments',
            element: (
              <PermissionGate permission="position.READ">
                <AssignmentsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'finance/cash',
            element: (
              <PermissionGate permission="cash.READ">
                <CashAccountsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'finance/invoices',
            element: (
              <PermissionGate permission="invoice.READ">
                <InvoicesPage />
              </PermissionGate>
            ),
          },
          {
            path: 'finance/payments',
            element: (
              <PermissionGate permission="payment.READ">
                <PaymentsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'finance/expenses',
            element: (
              <PermissionGate permission="cash.READ">
                <ExpensesPage />
              </PermissionGate>
            ),
          },
          {
            path: 'finance/reports',
            element: (
              <PermissionGate permission="report.READ">
                <ReportsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'events',
            element: (
              <PermissionGate permission="event.READ">
                <EventsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'events/:id',
            element: (
              <PermissionGate permission="event.READ">
                <EventDetailPage />
              </PermissionGate>
            ),
          },
          {
            path: 'elections',
            element: (
              <PermissionGate permission="election.READ">
                <ElectionsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'elections/:id',
            element: (
              <PermissionGate permission="election.READ">
                <ElectionDetailPage />
              </PermissionGate>
            ),
          },
          {
            path: 'elections/results',
            element: (
              <PermissionGate permission="election.READ">
                <ElectionResultsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'me/attendance',
            element: (
              <PermissionGate permission="event.READ">
                <MyAttendancePage />
              </PermissionGate>
            ),
          },
          {
            path: 'me/elections',
            element: (
              <PermissionGate permission="election.READ">
                <MyElectionsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'me/invoices',
            element: (
              <PermissionGate permission="invoice.READ">
                <MyInvoicesPage />
              </PermissionGate>
            ),
          },
          {
            path: 'me/payments',
            element: (
              <PermissionGate permission="payment.READ">
                <MyPaymentsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'me/documents',
            element: (
              <PermissionGate permission="document.READ">
                <MyDocumentsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'system/roles',
            element: (
              <PermissionGate permission="role.READ">
                <RolesPage />
              </PermissionGate>
            ),
          },
          {
            path: 'system/roles/:id',
            element: (
              <PermissionGate permission="role.READ">
                <RoleDetailPage />
              </PermissionGate>
            ),
          },
          {
            path: 'system/permissions',
            element: (
              <PermissionGate permission="role.READ">
                <PermissionsPage />
              </PermissionGate>
            ),
          },
          {
            path: 'system/menus',
            element: (
              <PermissionGate permission="role.READ">
                <MenusPage />
              </PermissionGate>
            ),
          },
          {
            path: 'system/users',
            element: (
              <PermissionGate permission="user.READ">
                <SystemUsersPage />
              </PermissionGate>
            ),
          },
          {
            path: 'system/audit',
            element: (
              <PermissionGate permission="audit.READ">
                <AuditPage />
              </PermissionGate>
            ),
          },
          { path: '403', element: <ForbiddenPage /> },
          { path: '*', element: <AppPlaceholderPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
