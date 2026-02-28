import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Gallery from "./components/Gallery";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Gallery />,
  },
  {
    path: "/admin",
    element: <AdminLogin />,
  },
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
