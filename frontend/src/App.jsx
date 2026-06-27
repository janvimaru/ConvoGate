import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './Context/ThemeContext'
import { AuthProvider } from './Context/AuthContext'
import Login from './Pages/Login'
import Signup from './Pages/Signup'
import Layout from './Components/Layout/Layout'
import ChatRoom from './Pages/ChatRoom'
import CreateRoom from './Pages/CreateRoom'
import JoinRoom from './Pages/JoinRoom'
import ProfileSettings from './Pages/ProfileSettings'
import Dashboard from './Pages/Dashboard'
import SearchResults from './Pages/SearchResults'
import ProtectedRoute from './Components/ProtectedRoute'
import PublicRoute from './Components/PublicRoute'
import './App.css'



// export default App

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>

            {/* Root */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public Routes (BLOCK when logged in) */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="chat/:roomId" element={<ChatRoom />} />
              <Route path="create-room" element={<CreateRoom />} />
              <Route path="join-room" element={<JoinRoom />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="settings" element={<ProfileSettings />} />
              <Route path="search" element={<SearchResults />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App;