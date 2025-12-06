import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import SchoolList from "../pages/Schools/SchoolList";
import ManageSchools from "../pages/Dashboard/ManageSchools";
import Layout from "../layouts/Layout";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("companyToken");
  return token ? children : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Private Layout Routes */}
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schools" element={<SchoolList />} />
          <Route path="/ManageSchools" element={<ManageSchools />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
