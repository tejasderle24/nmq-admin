import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/auth/Login";
// import Register from "./pages/auth/Register";
import Dashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Advertisements from "./pages/admin/Advertisements";
import ShopManagement from "./pages/admin/ShopManagement";


export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login role="admin" title="Admin Portal" subtitle="Sign In to Manage Orgination" />} />

        {/* <Route path="/register" element={<Register />}/> */}

        <Route element={<ProtectedRoute allowedRoles={["ADMIN", "OWNER", "STAFF"]} />}>
          <Route element={<Layout />}>
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/shops" element={<ShopManagement />} />
              <Route path="/admin/advertisements" element={<Advertisements />} />
            </Route>

          </Route>
        </Route>

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}