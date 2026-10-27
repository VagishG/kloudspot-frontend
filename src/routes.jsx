import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/Protectedroutes";

const Login = lazy(() => import("./pages/Login"));
const DashboardLayout = lazy(() => import("./pages/DashboardLayout"));
const Home = lazy(() => import("./pages/Home"));
const CrowdEntries = lazy(() => import("./pages/CrowdEntries"));

const RouteLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#45b8b3] border-t-transparent" />
  </div>
);

const page = (element) => (
  <Suspense fallback={<RouteLoader />}>{element}</Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },

  /* =========================
     PUBLIC ROUTES
  ========================= */

  {
    path: "/login",
    element: page(<Login />),
  },


  /* =========================
     PROTECTED ROUTES
  ========================= */

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: page(<DashboardLayout />),
        children: [
          {
            index: true,
            element: page(<Home />),
          },
          {
            path: "crowdentries",
            element: page(<CrowdEntries />),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

export default router;
