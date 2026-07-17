import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState("");

  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);


  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);


  const handleResendOTP = async () => {
    try {
      setResendLoading(true);

      const { data } = await api.post("/auth/resend-otp", {
        email,
      });

      toast.success(data.message);

      setOtp("");
      setResendCooldown(60);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to resend OTP"
      );
    } finally {
      setResendLoading(false);
    }
  };

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

        <div className="text-center mt-5">
          <p className="text-gray-600 text-sm mb-2">
            Didn't receive the OTP?
          </p>

          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendLoading || resendCooldown > 0}
            className="text-blue-600 font-semibold hover:underline disabled:text-gray-400 disabled:no-underline"
          >
            {resendLoading
              ? "Sending..."
              : resendCooldown > 0
                ? `Resend OTP in ${resendCooldown}s`
                : "Resend Verification OTP"}
          </button>
        </div>

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