// src/pages/RedirectPage.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../redux/store';

const RedirectPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-lg shadow-md text-center w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Welcome {user?.firstName}!</h2>
        <p className="text-gray-700 mb-6">
          Please choose where you want to go:
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleNavigation('/home')}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Go to Homepage
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => handleNavigation('/admin')}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
            >
              Go to Admin Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedirectPage;
