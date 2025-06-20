import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import RoleBasedLayout from './layouts/roleBasedLayout';

import { AuthProvider } from './contexts/authContext';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import ProtectedRoute from './components/protectedRoute';
import { Home, Unauthorized, InvalidRequest, SignOut, VerificationSuccess } from './pages/general/index'
import UserList from './pages/admin/user/UserList';
import Login from './pages/account/login';
import Register from './pages/account/register';
import Yard from './pages/general/yard';
import SportsVenueDashboard from './pages/manager/sportField/SportsVenueDashboard';
import TypeDashboard from './pages/manager/type/TypeDashboard';
import YardDetail from './pages/general/yardDetail';
import { PublicProvider } from "./contexts/publicContext";
import BookingSchedule from './pages/general/bookingSchedule';
import BookingSuccess from './pages/general/bookingSuccess';
import ConsumableDashboard from './pages/manager/consumable/ConsumableDashboard';
import EquipmentDashboard from './pages/manager/equipment/EquipmentDashboard';
import BookingList from './pages/manager/booking/BookingList';
import MatchmakingList from './pages/general/MatchmakingList';
import BookingHistory from './pages/general/BookingHistory';
/**
 * Roles include GUEST, CUSTOMER, ADMIN, MANAGER
 */

const router = createBrowserRouter([
  {
    path: "/",
    element: <RoleBasedLayout />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        )

      },
      {
        path: "/login",
        element: (
          <ProtectedRoute>
            <Login />
          </ProtectedRoute>
        )

      },
      {
        path: "/register",
        element: (
          <ProtectedRoute>
            <Register />
          </ProtectedRoute>
        )

      },
      {
        path: "sign-out",
        element: (
          <ProtectedRoute>
            <SignOut />,
          </ProtectedRoute>
        )
      },
      {
        path: "yard",
        element: (
          <ProtectedRoute>
            <Yard />,
          </ProtectedRoute>
        )
      },
      {
        path: "/yard-detail/:id",
        element: (
          <ProtectedRoute requiredRoles={['GUEST', 'CUSTOMER']}>
            <YardDetail />
          </ProtectedRoute>
        )
      },
           {
        path: "/booking/:typeId",
        element: (
          <ProtectedRoute requiredRoles={['GUEST', 'CUSTOMER']}>
            <BookingSchedule />
          </ProtectedRoute>
        )
      },
           {
        path: "/booking-success/:id",
        element: (
          <ProtectedRoute requiredRoles={['GUEST', 'CUSTOMER']}>
            <BookingSuccess />
          </ProtectedRoute>
        )
      },
          {
        path: "/matchmaking-list",
        element: (
          <ProtectedRoute requiredRoles={['GUEST', 'CUSTOMER']}>
            <MatchmakingList />
          </ProtectedRoute>
        )
      },
          {
        path: "/booking-history",
        element: (
          <ProtectedRoute requiredRoles={['GUEST', 'CUSTOMER']}>
            <BookingHistory />
          </ProtectedRoute>
        )
      },
      {
        path: "manager",
        children: [
          {
            path: "user-list",
            element: (
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <UserList />
              </ProtectedRoute>
            ),
          },
          {
            path: "type-list",
            element: (
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <TypeDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: "sport-field-list",
            element: (
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <SportsVenueDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: "equipment-list",
            element: (
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <EquipmentDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: "consumable-list",
            element: (
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <ConsumableDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: "booking-list",
            element: (
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <BookingList />
              </ProtectedRoute>
            ),
          },
        ]
      },
      {
        path: "admin",
        children: [
          {
            path: "user-list",
            element: (
              <ProtectedRoute>
                <UserList />
              </ProtectedRoute>
            ),
          },
          {
            path: "type-list",
            element: (
              <ProtectedRoute>
                <UserList />
              </ProtectedRoute>
            ),
          },
          {
            path: "sport-field-list",
            element: (
              <ProtectedRoute>
                <UserList />
              </ProtectedRoute>
            ),
          }
        ],
      },
      {
        path: "unauthorized",
        element: (
          <ProtectedRoute>
            <Unauthorized />
          </ProtectedRoute>
        )
      },
      {
        path: "invalid",
        element: (
          <ProtectedRoute>
            <InvalidRequest />
          </ProtectedRoute>
        )
      },
      {
        path: "verification-success",
        element: (
          <ProtectedRoute >
            <VerificationSuccess />
          </ProtectedRoute>
        )
      },
    ],
  },


]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <PublicProvider>
      <RouterProvider router={router} />
      </PublicProvider>
    </AuthProvider>
  </StrictMode>
);
