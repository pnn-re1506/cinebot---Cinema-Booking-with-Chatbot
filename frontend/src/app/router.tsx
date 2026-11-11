import { lazy } from "react";
import { createBrowserRouter, type RouteObject } from "react-router";
import { LazyPage } from "./LazyPage";
import { AdminLayout } from "./layouts/AdminLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { ProtectedRoute } from "./ProtectedRoute";

const HomePage = lazy(() => import("@/pages/HomePage").then((module) => ({ default: module.HomePage })));
const MovieDetailPage = lazy(() =>
  import("@/pages/MovieDetailPage").then((module) => ({ default: module.MovieDetailPage })),
);
const BookingPage = lazy(() =>
  import("@/pages/BookingPage").then((module) => ({ default: module.BookingPage })),
);
const CheckoutPage = lazy(() =>
  import("@/pages/CheckoutPage").then((module) => ({ default: module.CheckoutPage })),
);
const PaymentResultPage = lazy(() =>
  import("@/pages/PaymentResultPage").then((module) => ({ default: module.PaymentResultPage })),
);
const DemoPayPage = lazy(() =>
  import("@/pages/DemoPayPage").then((module) => ({ default: module.DemoPayPage })),
);
const LookupPage = lazy(() =>
  import("@/pages/LookupPage").then((module) => ({ default: module.LookupPage })),
);
const MembershipPage = lazy(() =>
  import("@/pages/MembershipPage").then((module) => ({ default: module.MembershipPage })),
);
const CinemaPage = lazy(() =>
  import("@/pages/CinemaPage").then((module) => ({ default: module.CinemaPage })),
);
const AccountPage = lazy(() =>
  import("@/pages/AccountPage").then((module) => ({ default: module.AccountPage })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })),
);
const AdminLoginPage = lazy(() =>
  import("@/pages/admin/AdminLoginPage").then((module) => ({ default: module.AdminLoginPage })),
);
const AdminDashboardPage = lazy(() =>
  import("@/pages/admin/AdminDashboardPage").then((module) => ({ default: module.AdminDashboardPage })),
);
const AdminMoviesPage = lazy(() =>
  import("@/pages/admin/AdminMoviesPage").then((module) => ({ default: module.AdminMoviesPage })),
);
const AdminRoomsPage = lazy(() =>
  import("@/pages/admin/AdminRoomsPage").then((module) => ({ default: module.AdminRoomsPage })),
);
const AdminShowtimesPage = lazy(() =>
  import("@/pages/admin/AdminShowtimesPage").then((module) => ({ default: module.AdminShowtimesPage })),
);
const AdminTemplatesPage = lazy(() =>
  import("@/pages/admin/AdminTemplatesPage").then((module) => ({ default: module.AdminTemplatesPage })),
);
const AdminPricingPage = lazy(() =>
  import("@/pages/admin/AdminPricingPage").then((module) => ({ default: module.AdminPricingPage })),
);
const AdminSnacksPage = lazy(() =>
  import("@/pages/admin/AdminSnacksPage").then((module) => ({ default: module.AdminSnacksPage })),
);
const AdminBookingsPage = lazy(() =>
  import("@/pages/admin/AdminBookingsPage").then((module) => ({ default: module.AdminBookingsPage })),
);
const AdminAuditLogPage = lazy(() =>
  import("@/pages/admin/AdminAuditLogPage").then((module) => ({ default: module.AdminAuditLogPage })),
);

export const appRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <LazyPage><HomePage /></LazyPage> },
      { path: "movies/:slug", element: <LazyPage><MovieDetailPage /></LazyPage> },
      { path: "booking/:showtimeId", element: <LazyPage><BookingPage /></LazyPage> },
      { path: "checkout/:bookingId/result", element: <LazyPage><PaymentResultPage /></LazyPage> },
      { path: "checkout/:bookingId", element: <LazyPage><CheckoutPage /></LazyPage> },
      { path: "pay/mock/:paymentId", element: <LazyPage><DemoPayPage /></LazyPage> },
      { path: "bookings/lookup", element: <LazyPage><LookupPage /></LazyPage> },
      { path: "membership", element: <LazyPage><MembershipPage /></LazyPage> },
      { path: "cinema", element: <LazyPage><CinemaPage /></LazyPage> },
      {
        element: <ProtectedRoute />,
        children: [{ path: "account", element: <LazyPage><AccountPage /></LazyPage> }],
      },
      { path: "*", element: <LazyPage><NotFoundPage /></LazyPage> },
    ],
  },
  {
    path: "admin/login",
    element: <LazyPage><AdminLoginPage /></LazyPage>,
  },
  {
    path: "admin",
    element: <AdminLayout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <LazyPage><AdminDashboardPage /></LazyPage> },
          { path: "movies", element: <LazyPage><AdminMoviesPage /></LazyPage> },
          { path: "rooms", element: <LazyPage><AdminRoomsPage /></LazyPage> },
          { path: "showtimes", element: <LazyPage><AdminShowtimesPage /></LazyPage> },
          { path: "templates", element: <LazyPage><AdminTemplatesPage /></LazyPage> },
          { path: "pricing", element: <LazyPage><AdminPricingPage /></LazyPage> },
          { path: "snacks", element: <LazyPage><AdminSnacksPage /></LazyPage> },
          { path: "bookings", element: <LazyPage><AdminBookingsPage /></LazyPage> },
          { path: "audit-log", element: <LazyPage><AdminAuditLogPage /></LazyPage> },
          { path: "*", element: <LazyPage><NotFoundPage /></LazyPage> },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(appRoutes);
