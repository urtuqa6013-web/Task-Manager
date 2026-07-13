import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { registerSchema } from "../validations/authSchema";
import toast from "react-hot-toast";



const Register = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    const validation =
      registerSchema.safeParse(formData);

    if (!validation.success) {
      toast.error(
        validation.error.issues[0].message
      );
      return;
    }



    try {
      setLoading(true);
      const { data } = await api.post("/auth/register", formData);

      toast.success(data.message);

      navigate("/verify-otp", {
        state: {
          email: formData.email,
        },
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 w-96"
      >
        <h2 className="text-3xl font-bold text-center mb-6">
          Register
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full border p-3 rounded mb-4"
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border p-3 rounded mb-4"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full border p-3 rounded mb-4"
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 w-full text-white py-3 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center mt-4">
          Already have an account?{" "}
          <Link
            className="text-blue-600 font-bold"
            to="/login"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;