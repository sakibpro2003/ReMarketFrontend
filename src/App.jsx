import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import CreateListing from "./pages/CreateListing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";

const App = () => {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === "admin";

  if (loading) {
    return (
      <div className="page">
        <div className="auth-card">
          <h1>Checking session</h1>
          <p>Please wait a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : isAdmin ? (
            <Navigate to="/admin" replace />
          ) : (
            <Home />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : isAdmin ? (
            <Navigate to="/admin" replace />
          ) : (
            <UserDashboard />
          )
        }
      />
      <Route
        path="/dashboard/new"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : isAdmin ? (
            <Navigate to="/admin" replace />
          ) : (
            <CreateListing />
          )
        }
      />
      <Route
        path="/dashboard/listings"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : isAdmin ? (
            <Navigate to="/admin" replace />
          ) : (
            <UserDashboard />
          )
        }
      />
      <Route
        path="/dashboard/orders"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : isAdmin ? (
            <Navigate to="/admin" replace />
          ) : (
            <UserDashboard />
          )
        }
      />
      <Route
        path="/admin"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : isAdmin ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/admin/listings"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : isAdmin ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/admin/commission"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : isAdmin ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/admin/users"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : isAdmin ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={isAdmin ? "/admin" : "/"} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            <Navigate to={isAdmin ? "/admin" : "/"} replace />
          ) : (
            <Register />
          )
        }
      />
      <Route
        path="*"
        element={
          user ? (
            <Navigate to={isAdmin ? "/admin" : "/"} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;
