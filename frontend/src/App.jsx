import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import { AdminRoute, GuestRoute, ProtectedRoute } from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Clubs from "./pages/Clubs";
import ClubDetails from "./pages/ClubDetails";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public pages */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Logged-in pages (with sidebar) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clubs" element={<Clubs />} />
              <Route path="/clubs/:id" element={<ClubDetails />} />
              <Route path="/events" element={<Events />} />
              <Route path="/profile" element={<Profile />} />

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
