import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "./context/AuthContext";
import { useEffect } from "react";

// layouts
import AuthLayout from "./Layout/AuthLayout/AuthLayout";
import AppLayout from "./Layout/AppLayout/AppLayout";
import AdminLayout from "./Layout/AdminLayout/AdminLayout";

// guards
import RequireAuth from "./routes/RequireAuth";
import RequireSetup from "./routes/RequireSetup";
import RequireAdmin from "./routes/RequireAdmin";

// auth pages
import LandingPage from "./pages/LandingPage/LandingPage";
import Login from "./pages/Login/Login";
import SignUp from "./pages/SignUp/SignUp";
import ForgetPassword from "./pages/ForgetPassword/ForgetPassword";
import WaitingApproval from "./pages/WaitingApproval/WaitingApproval";
import InformationPage from "./pages/InformationPage/InformationPage";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

// app pages
import FeedPage from "./pages/FeedPage/FeedPage";
import Shelters from "./pages/Shelters/Shelters";
import Stores from "./pages/Stores/Stores";
import Clinics from "./pages/Clinics/Clinics";
import Profile from "./pages/Profile/Profile";
import SetupPage from "./pages/SetupPage/SetupPage";
import SavedPage from "./pages/SavedPage/SavedPage";
import PostDetails from "./pages/PostDetails/PostDetails";
import ClinicDetails from "./pages/ClinicDetails/ClinicDetails";
import ShelterDetails from "./pages/ShelterDetails/ShelterDetails";
import AnimalDetails from "./pages/AnimalDetails/AnimalDetail";
import StoreDetails from "./pages/StoreDetails/StoreDetails";
import MyActivities from "./pages/MyActivities/MyActivities";

// doctor pages
import DoctorDashboard from "./components/Dashboard/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";

// store pages
import StoreDashboard from "./components/Dashboard/StoreDashboard";

// shelter pages
import ShelterDashboard from "./components/Dashboard/ShelterDashboard";

// admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import UsersRequests from "./pages/UsersRequests/UsersRequests";

// not found
import NotFound from "./pages/NotFound/NotFound";

const API_BASE =
  import.meta?.env?.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function App() {
  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((r) => r.json())
      .then((data) => console.log("API RESPONSE:", data))
      .catch((err) => console.error("API ERROR:", err));
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <AuthLayout />,
      children: [
        { index: true, element: <LandingPage /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <SignUp /> },
        { path: "forgot-password", element: <ForgetPassword /> },
        { path: "information", element: <InformationPage /> },
        { path: "waiting-approval", element: <WaitingApproval /> },
        { path: "reset-password", element: <ResetPassword /> },
      ],
    },

    {
      path: "app",
      element: (
        <RequireAuth>
          <AppLayout />
        </RequireAuth>
      ),
      children: [
        { index: true, element: <Navigate to="feed" replace /> },

        { path: "feed", element: <FeedPage /> },
        { path: "posts/:id", element: <PostDetails /> },

        { path: "clinics", element: <Clinics /> },
        { path: "clinics/:id", element: <ClinicDetails /> },

        { path: "shelters", element: <Shelters /> },
        { path: "shelters/:id", element: <ShelterDetails /> },

        { path: "animal-details", element: <AnimalDetails /> },

        { path: "stores", element: <Stores /> },
        { path: "stores/:id", element: <StoreDetails /> },

        { path: "profile", element: <Profile /> },
        { path: "saved", element: <SavedPage /> },
        { path: "my-activities", element: <MyActivities /> },

        { path: "setup", element: <SetupPage /> },

        {
          element: <RequireSetup />,
          children: [
            { path: "dashboard", element: <DoctorDashboard /> },
            { path: "dashboard/appointments", element: <DoctorAppointments /> },
            { path: "store-dashboard", element: <StoreDashboard /> },
            { path: "shelter-dashboard", element: <ShelterDashboard /> },
          ],
        },
      ],
    },

    {
      path: "admin",
      element: (
        <RequireAuth>
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        </RequireAuth>
      ),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <AdminDashboard /> },
        { path: "users", element: <AdminUsers /> },
        { path: "users-requests", element: <UsersRequests /> },
      ],
    },

    { path: "*", element: <NotFound /> },
  ]);

  return (
    <AuthProvider>
      <HeroUIProvider>
        <RouterProvider router={router} />
      </HeroUIProvider>
    </AuthProvider>
  );
}