import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import SiteLayout from "./layouts/SiteLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Trips from "./pages/Trips";
import TripDetail from "./pages/TripDetail";
import Feed from "./pages/Feed";
import { getStoredUser } from "./services/auth";

const RequireAuth = ({ children }) => {
  const user = getStoredUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route index element={<Login />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
      <Route element={<SiteLayout />}>
        <Route path="home" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="trips" element={<RequireAuth><Trips /></RequireAuth>} />
        <Route path="feed" element={<RequireAuth><Feed /></RequireAuth>} />
        <Route path="trips/:id" element={<RequireAuth><TripDetail /></RequireAuth>} />
        <Route
          path="profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
