import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {

  const token = localStorage.getItem("token");

  return (

    <Routes>

      <Route
        path="/"
        element={
          token ? (
            <Navigate to="/dashboard" />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/dashboard"
        element={
          token ? (
            <Dashboard />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" />}
      />

    </Routes>

  );
}

export default App;