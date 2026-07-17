import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

const Layout = ({ children }: PropsWithChildren) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Task Manager</h1>

          <div className="flex gap-5 items-center">
            <Link to="/dashboard">Dashboard</Link>

            {user.role === "admin" && (
              <Link to="/admin/users">User Management</Link>
            )}

            <span>{user.name}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;