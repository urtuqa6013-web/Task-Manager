import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { data } = await api.post("/auth/verify-otp", {
        email,
        otp,
      });

      toast.success(data.message);

      navigate("/login");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleVerify}
        className="bg-white p-8 rounded-lg shadow-lg w-96"
      >
        <h2 className="text-3xl font-bold text-center mb-6">
          Verify Email
        </h2>

        <p className="text-center mb-4">
          Enter the OTP sent to
          <br />
          <strong>{email}</strong>
        </p>

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          className="w-full border p-3 rounded mb-4"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

export default VerifyOTP;