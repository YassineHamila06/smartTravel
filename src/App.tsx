import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import TripsManagement from "./components/TripsManagement";
import UsersManagement from "./components/UsersManagement";
import ProfileManagement from "./components/ProfileManagement";
import ReservationsManagement from "./components/TripsReservationsManagement";
import CommunityManagement from "./components/CommunityManagement";
import Login from "./components/login";
import EventsManagement from "./components/EventsManagement";
import EventsReservationsManagement from "./components/EventsReservationsManagement";
import RewardsManagement from "./components/RewardsManagement";
//survey components
import { SurveyProvider } from "./components/SurveyContext";
import SurveyManagement from "./components/surveyPages/SurveyManagement";
import SurveyEditorPage from "./components/surveyPages/SurveyEditorPage";
import SurveyResponsesPage from "./components/survey/responses/SurveyResponsesPage";
import { AuthProvider, ProtectedRoute } from "./contexts/AuthContext";
import React, { ReactNode } from "react";

// Layout component to avoid repetition
interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => (
  <div className="flex h-screen w-full">
    <Sidebar />
    <main className="flex-1 bg-gray-100 overflow-auto p-6">{children}</main>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <SurveyProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected routes with shared layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/trips"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <TripsManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <UsersManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reservations"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ReservationsManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/event-reservations"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <EventsReservationsManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CommunityManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <EventsManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/surveys"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SurveyManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-survey"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SurveyEditorPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit-survey/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SurveyEditorPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/responses/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SurveyResponsesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ProfileManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/event-reservations"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <EventsReservationsManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/rewards"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <RewardsManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </SurveyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
