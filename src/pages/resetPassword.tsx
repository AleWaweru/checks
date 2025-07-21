import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const { token, id } = useParams<{ token: string; id: string }>();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isStrongPassword = (pw: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isStrongPassword(newPassword)) {
      toast.error("Password must be 8+ chars, include upper, lower & number.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", {
        token,
        id,
        newPassword,
      });

      toast.success("Password reset! You can now login.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 shadow rounded bg-white">
      <h2 className="text-xl font-bold mb-4">Reset Your Password</h2>
      <form onSubmit={handleResetPassword}>
        <input
          type="password"
          placeholder="New Password"
          className="w-full border px-4 py-2 rounded mb-4"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      <p className="mt-4 text-sm text-center">
        Back to{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default ResetPassword;
