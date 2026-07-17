import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import toast from "react-hot-toast";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  dueDate?: string;
  attachment?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ===========================
  // States
  // ===========================

  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const [roleFilter, setRoleFilter] = useState("All");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [attachment, setAttachment] = useState<File | null>(null);


  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    progress: 0,
    completed: 0,
  });

  // ===========================
  // Debounce Search
  // ===========================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword]);




  // ===========================
  // Get Tasks
  // ===========================

  const getTasks = async () => {
    try {
      const { data } = await api.get(
        `/tasks?page=${page}&keyword=${debouncedKeyword}&role=${roleFilter}`
      );

      setTasks(data.tasks);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.log(error);
    }
  };

  // ===========================
  // Dashboard Stats
  // ===========================

  const getStats = async () => {
    try {
      const { data } = await api.get("/tasks/stats");

      setStats(data.stats);
    } catch (error) {
      console.log(error);
    }
  };


  // Create / Update Task
 
  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, {
          title,
          description,
          status,
        });

        toast.success("Task Updated");
        setEditingId("");
      } else {

        
        const formData = new FormData();

        formData.append("title", title);
        formData.append("description", description);
        formData.append("status", status);

        if (attachment) {
          formData.append("attachment", attachment);
        }

        await api.post("/tasks/create", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Task Created");

      }

      setTitle("");
      setDescription("");
      setStatus("Pending");
      setAttachment(null);

      getTasks();
      getStats();

    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    }
  };


  // Delete Task
  const deleteTask = async (id: string) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await api.delete(`/tasks/${id}`);

      toast.success("Task Deleted");

      getTasks();
      getStats();

    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Delete failed"
      );
    }
  };


  // Logout


  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };


  // Load Data


  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    getTasks();
    getStats();

  }, [page, debouncedKeyword, roleFilter]);
  return (
    <Layout>



      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold">
            {user.role === "admin"
              ? "Admin Dashboard"
              : user.role === "manager"
                ? "Manager Dashboard"
                : "User Dashboard"}
          </h1>

          <p className="text-gray-600 mt-1">
            Welcome, <span className="font-semibold">{user.name}</span>
          </p>
        </div>

        <div className="flex gap-3">

          {user.role === "admin" && (
            <button
              onClick={() => navigate("/admin/users")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded">
              Admin Panel
            </button>
          )}

          {user.role === "manager" && (
            <button
              onClick={() => navigate("/admin/users")}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded">
              Users
            </button>
          )}

          <button
            onClick={() => navigate("/profile")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded">
            Profile
          </button>

          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded">
            Logout
          </button>

        </div>

      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">

        <div className="bg-white shadow rounded-lg p-5">
          <p className="text-gray-500">Total Tasks</p>
          <h1 className="text-3xl font-bold mt-2">
            {stats.total}
          </h1>
        </div>

        <div className="bg-yellow-100 shadow rounded-lg p-5">
          <p className="text-gray-600">Pending</p>
          <h1 className="text-3xl font-bold mt-2">
            {stats.pending}
          </h1>
        </div>

        <div className="bg-blue-100 shadow rounded-lg p-5">
          <p className="text-gray-600">In Progress</p>
          <h1 className="text-3xl font-bold mt-2">
            {stats.progress}
          </h1>
        </div>

        <div className="bg-green-100 shadow rounded-lg p-5">
          <p className="text-gray-600">Completed</p>
          <h1 className="text-3xl font-bold mt-2">
            {stats.completed}
          </h1>
        </div>

      </div>



      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">

        <h2 className="text-2xl font-bold mb-5">
          {editingId ? "Update Task" : "Create New Task"}
        </h2>

        <form onSubmit={createTask}>

          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border w-full p-3 rounded mb-4"
          />

          <textarea
            rows={4}
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border w-full p-3 rounded mb-4"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border w-full p-3 rounded mb-4"
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>

          <input
            type="file"
            accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
            className="border w-full p-3 rounded mb-4"
            onChange={(e) => {
              if (e.target.files) {
                setAttachment(e.target.files[0]);
              }
            }}
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded"
          >
            {editingId ? "Update Task" : "Create Task"}
          </button>

        </form>

      </div>



      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">

        <input
          type="text"
          placeholder="Search tasks..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
          className="border rounded-lg p-3 w-full md:w-96"
        />

        <div className="flex gap-3">

          {user.role !== "user" && (
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="border rounded-lg p-3"
            >
              <option value="All">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
          )}

        </div>

      </div>



      <h2 className="text-2xl font-bold mb-5">
        My Tasks
      </h2>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 text-lg">
            No Tasks Found
          </p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

            {tasks.map((task) => (
              <div
                key={task._id}
                className="bg-white rounded-lg shadow-lg p-5"
              >

                <h2 className="text-xl font-bold">{task.title}</h2>

                <p className="text-gray-600 mt-2">
                  {task.description}
                </p>

                <span className="inline-block mt-3 bg-gray-200 px-3 py-1 rounded">
                  {task.status}
                </span>

                {/* Attachment */}
                {task.attachment && (
                  <div className="mt-3">
                    <img
                      src={task.attachment}
                      alt="Attachment"
                      className="w-40 h-40 object-cover rounded-lg border"
                    />

                    <a
                      href={task.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2 text-blue-600 underline"
                    >
                      Open Full Image
                    </a>
                  </div>
                )}

                <div className="mt-4">

                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm
                    ${task.status === "Completed"
                        ? "bg-green-500"
                        : task.status === "In Progress"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                      }`}
                  >
                    {task.status}
                  </span>

                </div>

                {(user.role === "admin" || user.role === "manager") &&
                  task.user && (
                    <div className="mt-4 border-t pt-3">
                      <p className="font-semibold">
                        {task.user.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {task.user.email}
                      </p>

                      <span className="inline-block mt-2 bg-gray-200 px-3 py-1 rounded text-sm">
                        {task.user.role}
                      </span>
                    </div>
                  )}

                <div className="flex gap-3 mt-5">

                  <button
                    type="button"
                    onClick={() => {
                      console.log("Before:", {
                        editingId,
                        title,
                        description,
                        status,
                      });

                      setEditingId(task._id);
                      setTitle(task.title);
                      setDescription(task.description);
                      setStatus(task.status);

                      setTimeout(() => {
                        console.log("After Click:", {
                          editingId,
                          title,
                          description,
                          status,
                        });
                      }, 100);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>



          <div className="flex justify-end items-center gap-4 mt-8">

            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span className="font-semibold">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Next
            </button>

          </div>
        </>
      )}

    </Layout>
  );
};

export default Dashboard;