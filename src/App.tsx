import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import {
  Home,
  About,
  Login,
  Register,
  Dashboard,
  ModulesList,
  LessonDetail,
  Announcements,
  Feedback,
  StaffDashboard,
  AdminDashboard,
  Settings,
  StaffModuleManager,
  QuizView,
} from "./pages";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout requiresAuth={false} />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Routes - All Authenticated Users */}
      <Route element={<MainLayout requiresAuth={true} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/modules" element={<ModulesList />} />
        <Route
          path="/modules/:id/lessons/:lessonId"
          element={<LessonDetail />}
        />
        <Route path="/modules/:id/quizzes/:quizId" element={<QuizView />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Protected Routes - Learners Only */}
      <Route
        element={<MainLayout requiresAuth={true} allowedRoles={["learner"]} />}
      >
        <Route path="/feedback" element={<Feedback />} />
      </Route>

      {/* Protected Routes - Staff Only */}
      <Route
        element={
          <MainLayout requiresAuth={true} allowedRoles={["staff", "admin"]} />
        }
      >
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/staff/modules/:id" element={<StaffModuleManager />} />
      </Route>

      {/* Protected Routes - Admin Only */}
      <Route
        element={<MainLayout requiresAuth={true} allowedRoles={["admin"]} />}
      >
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
