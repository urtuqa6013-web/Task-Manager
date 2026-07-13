import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import Layout from "../components/Layout";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  // ==========================
  // Get All Users
  // ==========================
  const getUsers = async () => {
    try {
      const { data } = await api.get("/users/users");
      setUsers(data.users);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load users"
      );
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // ==========================
  // Change Role
  // ==========================
  const changeRole = async (id: string, role: string) => {
    try {
      const { data } = await api.put(`/users/${id}/role`, {
        role,
      });

      toast.success(data.message);

      getUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to change role"
      );
    }
  };

  // ==========================
  // Delete User
  // ==========================
  const deleteUser = async (id: string) => {
    const loggedInUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    if (id === loggedInUser.id) {
      toast.error("You cannot delete your own account.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      const { data } = await api.delete(`/users/${id}`);

      toast.success(data.message);

      getUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Delete failed"
      );
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">
        User Management
      </h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Verified</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-t"
              >
                <td className="p-4">{user.name}</td>

                <td className="p-4">{user.email}</td>

                <td className="p-4">
                  {user.isVerified ? "✅" : "❌"}
                </td>

                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      changeRole(user._id, e.target.value)
                    }
                    className="border rounded px-3 py-2"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                <td className="p-4">
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-8">
            No users found.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminUsers;