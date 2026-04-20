import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Waitlist from './pages/Waitlist';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import AdminDashboard from './pages/AdminDashboard';
import AdminColleges from './pages/AdminColleges';
import CollegeDashboard from './pages/CollegeDashboard';
import CollegeStudents from './pages/CollegeStudents';
import RegisterCollege from './pages/RegisterCollege';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, AuthContext } from './context/AuthContext';

function PublicLayout({ children }) {
  return (
    <div className="app-container">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'college') return <Navigate to="/college/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicOnlyRoute><PublicLayout><Home /></PublicLayout></PublicOnlyRoute>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/waitlist" element={<PublicLayout><Waitlist /></PublicLayout>} />
          <Route path="/login" element={<PublicOnlyRoute><PublicLayout><Login /></PublicLayout></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><PublicLayout><Signup /></PublicLayout></PublicOnlyRoute>} />
          <Route path="/register-college" element={<PublicLayout><RegisterCollege /></PublicLayout>} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute><DashboardLayout><Matches /></DashboardLayout></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><DashboardLayout><Chat /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/colleges" element={<ProtectedRoute><DashboardLayout><AdminColleges /></DashboardLayout></ProtectedRoute>} />
          <Route path="/college/dashboard" element={<ProtectedRoute><DashboardLayout><CollegeDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/college/students" element={<ProtectedRoute><DashboardLayout><CollegeStudents /></DashboardLayout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;