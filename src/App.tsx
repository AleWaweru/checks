import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Registration/register';
import Login from './components/Registration/login';
import Homepage from './components/Registration/HomePage';
import CreateLeaderForm from './components/Registration/createLeader';
import LandingPage from './components/landing/LandingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/createLeader" element={<CreateLeaderForm />} />
      </Routes>
    </Router>
  );
}

export default App;
