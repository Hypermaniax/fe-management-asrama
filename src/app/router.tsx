import { createBrowserRouter, Navigate } from 'react-router'

import { RequireAuth } from '@/components/shared/require-auth'
import { AppLayout } from '@/layouts/app-layout'
import { AuthLayout } from '@/layouts/auth-layout'
import { PublicLayout } from '@/layouts/public-layout'
import AppPlaceholderPage from '@/routes/app/placeholder'
import DashboardPage from '@/routes/app/dashboard'
import LoginPage from '@/routes/auth/login'
import RegisterPage from '@/routes/auth/register'
import VerifyOtpPage from '@/routes/auth/verify-otp'
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
          { path: '403', element: <ForbiddenPage /> },
          { path: '*', element: <AppPlaceholderPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
