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
import CategoriesPage from '@/features/category/pages/categories'
import FeeRulesPage from '@/features/fee-rule/pages/fee-rules'
import RoomFacilitiesPage from '@/features/facility/pages/room-facilities'
import PublicFacilitiesPage from '@/features/public-facility/pages/public-facilities'
import RoomsPage from '@/features/room/pages/rooms'
import RolesPage from '@/features/rbac/pages/roles'
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
            path: 'system/roles',
            element: (
              <PermissionGate permission="role.READ">
                <RolesPage />
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
