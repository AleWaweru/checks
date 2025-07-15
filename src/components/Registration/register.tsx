/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { RegionalData } from '../../utils/Regions/KenyanRegions';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../redux/reducers/authSlice';
import type { AppDispatch } from '../../redux/store';
import { Link, useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCountyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCounty(e.target.value);
    setSelectedConstituency('');
    setSelectedWard('');
  };

  const handleConstituencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedConstituency(e.target.value);
    setSelectedWard('');
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
      ).unwrap(); // if using createAsyncThunk
      alert('Registration successful!');
      navigate('/login');
    } catch (error: any) {
      alert(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const constituencies = selectedCounty
    ? RegionalData.find((c) => c.county === selectedCounty)?.constituencies || []
    : [];

  const wards = selectedConstituency
    ? constituencies.find((c) => c.name === selectedConstituency)?.wards || []
    : [];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Registration Form</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">County</label>
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
            <label className="block text-sm font-medium text-gray-700">Constituency</label>
            <select
              value={selectedConstituency}
              onChange={handleConstituencyChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              disabled={!selectedCounty}
              required
            >
              <option value="">Select Constituency</option>
              {constituencies.map((constituency) => (
                <option key={constituency.constituencyCode} value={constituency.name}>
                  {constituency.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ward</label>
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
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
