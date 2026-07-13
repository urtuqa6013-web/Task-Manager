import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import toast from "react-hot-toast";

const Profile = () => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    setName(storedUser.name || "");
    setEmail(storedUser.email || "");
   
  }, []);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data } = await api.put("/users/profile", {
        name,
        email,
      });

      toast.success(data.message);

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Update failed"
      );
    }
  };

  return (
    <Layout>

      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">

        <h1 className="text-3xl font-bold mb-6">
          My Profile
        </h1>

        <form onSubmit={updateProfile}>

          <label className="block mb-2 font-semibold">
            Name
          </label>

          <input
            type="text"
            className="border w-full p-3 rounded mb-5"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="block mb-2 font-semibold">
            Email
          </label>

          <input
            type="email"
            className="border w-full p-3 rounded mb-5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />


          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Update Profile
          </button>

        </form>

      </div>

    </Layout>
  );
};

export default Profile;