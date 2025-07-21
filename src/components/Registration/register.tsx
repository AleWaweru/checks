/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { RegionalData } from "../../utils/Regions/KenyanRegions";
import { useDispatch } from "react-redux";
import { registerUser } from "../../redux/reducers/authSlice";
import type { AppDispatch } from "../../redux/store";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
interface GoogleUser {
  email: string;
  given_name: string;
  family_name: string;
}

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedConstituency, setSelectedConstituency] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCountyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCounty(e.target.value);
    setSelectedConstituency("");
    setSelectedWard("");
  };

  const handleConstituencyChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedConstituency(e.target.value);
    setSelectedWard("");
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      const decoded: GoogleUser = jwtDecode(credentialResponse.credential);
      setFormData({
        email: decoded.email,
        firstName: decoded.given_name,
        lastName: decoded.family_name,
        password: "google-oauth",
      });
      setIsGoogleUser(true);
      toast.success(
        "Google login successful. Please complete location details.",
        {
          autoClose: 4000,
        } as any
      );
    } catch (err) {
      console.error("Failed to decode Google token:", err);
      toast.error("Failed to process Google login.", {
        autoClose: 4000,
      } as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dispatch(
        registerUser({
          ...formData,
          county: selectedCounty,
          constituency: selectedConstituency,
          ward: selectedWard,
        })
      ).unwrap();

      if (isGoogleUser) {
        toast.success("Registration via Google successful.", {
          duration: 4000,
        });
      } else {
        toast.success(
          "Registration successful! Please verify your email before logging in.",
          {
            duration: 4000,
          }
        );
      }

      setTimeout(() => navigate("/login"), 4000);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const constituencies = selectedCounty
    ? RegionalData.find((c) => c.county === selectedCounty)?.constituencies ||
      []
    : [];

  const wards = selectedConstituency
    ? constituencies.find((c) => c.name === selectedConstituency)?.wards || []
    : [];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Registration Form
        </h2>

        <div className="mb-4 text-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google sign-in failed")}
          />
        </div>
        <div className="text-sm text-gray-500 mb-4 text-center">
          or continue with email
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              readOnly={isGoogleUser}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              readOnly={isGoogleUser}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              readOnly={isGoogleUser}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          {!isGoogleUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              County
            </label>
            <select
              value={selectedCounty}
              onChange={handleCountyChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="">Select County</option>
              {RegionalData.map((county) => (
                <option key={county.countyCode} value={county.county}>
                  {county.county}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Constituency
            </label>
            <select
              value={selectedConstituency}
              onChange={handleConstituencyChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              disabled={!selectedCounty}
              required
            >
              <option value="">Select Constituency</option>
              {constituencies.map((c) => (
                <option key={c.constituencyCode} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ward
            </label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              disabled={!selectedConstituency}
              required
            >
              <option value="">Select Ward</option>
              {wards.map((ward) => (
                <option key={ward.wardCode} value={ward.name}>
                  {ward.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            {loading ? "Processing..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login here
          </Link>
        </p>
        {/* <p className="mt-2 text-sm text-center">
          Forgot your password?{" "}
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Reset here
          </Link>
        </p> */}
      </div>
    </div>
  );
};

export default Register;
