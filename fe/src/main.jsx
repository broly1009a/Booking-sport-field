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
import MaintenanceSchedule from './pages/manager/maintenance/MaintenanceSchedule';
import VnpayReturn from './pages/general/VnpayReturn';
import MatchmakingHistory from './pages/general/MatchmakingHistory';
import WalletHistory from './pages/general/WalletHistory';
import AnalyticsDashboard from './pages/manager/statistics/AnalyticsDashboard';
import Voucher from './pages/general/voucher';
import Event from './pages/general/Event';
import EventDashboard from './pages/manager/event/EventDashboard';
import About from './pages/general/About';
import NewsList from './pages/general/newsList';
import NewsDetail from './pages/general/newsDetail';
import NewsDashboard from './pages/manager/new/NewsDashboard';
import FavoriteList from './pages/general/favoriteList';
import Policy from './pages/general/Policy';
import CategoryPolicyList from './pages/manager/policy/CategoryPolicyList';
import PolicyList from './pages/manager/policy/PolicyList';
import Coupon from "./pages/admin/voucher/CouponManager";
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
        path: "/news",
        element: (
          <ProtectedRoute requiredRoles={['GUEST', 'CUSTOMER']}>
            <NewsList />
          </ProtectedRoute>
        )
      },
      {
        path: "/news/:id",
        element: (
          <ProtectedRoute requiredRoles={['GUEST', 'CUSTOMER']}>
            <NewsDetail />
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
        path: "/matchmaking-history",
        element: (
          <ProtectedRoute requiredRoles={['GUEST', 'CUSTOMER']}>
            <MatchmakingHistory />
          </ProtectedRoute>
        )
      },
      {
        path: "/wallet-history",
        element: (
          <ProtectedRoute requiredRoles={['GUEST', 'CUSTOMER']}>
            <WalletHistory />
          </ProtectedRoute>
        )
      },
      {
        path: "/vnpay_return_url",
        element: (
          <ProtectedRoute requiredRoles={['GUEST', 'CUSTOMER']}>
            <VnpayReturn />
          </ProtectedRoute>
        )
      },
      {
        path: "/voucher",
        element: (
          <ProtectedRoute requiredRoles={['GUEST', 'CUSTOMER']}>
            <Voucher />
          </ProtectedRoute>
        )
      },
      {
        path: "/event",
        element: (
          <ProtectedRoute requiredRoles={['GUEST', 'CUSTOMER']}>
            <Event />
          </ProtectedRoute>
        )
      },
      {
        path: "/about",
        element: (
          <ProtectedRoute requiredRoles={['GUEST', 'CUSTOMER']}>
            <About />
          </ProtectedRoute>
        )
      },
      {
        path: "/favorite",
        element: (
          <ProtectedRoute requiredRoles={['CUSTOMER']}>
            <FavoriteList />
          </ProtectedRoute>
        )
      },
      {
        path: "/policy",
        element: (
          <ProtectedRoute requiredRoles={['GUEST', 'CUSTOMER']}>
            <Policy />
          </ProtectedRoute>
        )
      },
     
      {
        path: "manager",
        children: [
          {
            path: "dashboard",
            element: (
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            ),
          },
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
          {
            path: "maintenance-schedule/:typeId",
            element: (
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <MaintenanceSchedule />
              </ProtectedRoute>
            ),
          },
          {
            path: "event-list",
            element: (
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <EventDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: "new-list",
            element: (
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <NewsDashboard />
              </ProtectedRoute>
            )
          },
          {
            path: "category-policy-list",
            element: (
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <CategoryPolicyList />
              </ProtectedRoute>
            ),
          },
          {
            path: "policy-list",
            element: (
              <ProtectedRoute requiredRoles={['MANAGER']}>
                <PolicyList />
              </ProtectedRoute>
            ),
          }
         

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
                <TypeDashboard />
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
          },
          {
            path: "voucher-list",
            element: (
              <ProtectedRoute>
                <Coupon />
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
  <AuthProvider>
    <PublicProvider>
      <RouterProvider router={router} />
    </PublicProvider>
  </AuthProvider>
);
