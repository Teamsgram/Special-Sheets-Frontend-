import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Login from "../pages/auth/login";
import MainLayout from "../layout";
import Home from "../pages/home";

function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp * 1000;
    return Date.now() > expiry;
  } catch (e) {
    return true;
  }
}

function PrivateOutlet() {
  const token = localStorage.getItem("xyz_to_ken");

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("xyz_to_ken");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

const routes = createBrowserRouter([
  {
    element: <PrivateOutlet />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <Home /> },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

export default routes;
