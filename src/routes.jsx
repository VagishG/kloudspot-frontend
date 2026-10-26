import { createBrowserRouter } from "react-router-dom";

import Login from "./pages/Login";
import DashboardLayout from "./pages/DashboardLayout";
import Home from "./pages/Home";
import CrowdEntries from "./pages/CrowdEntries";
import ProtectedRoute from "./components/Protectedroutes";

const router = createBrowserRouter([
  /* =========================
     PUBLIC ROUTES
  ========================= */

  {
    path: "/login",
    element: <Login />,
  },


  /* =========================
     PROTECTED ROUTES
  ========================= */

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "crowdentries",
            element: <CrowdEntries />,
          },
        ],
      },
    ],
  },
]);

export default router;