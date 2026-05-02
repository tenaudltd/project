import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ModulesList = lazy(() => import("./pages/ModulesList"));
const LessonDetail = lazy(() => import("./pages/LessonDetail"));
const Announcements = lazy(() => import("./pages/Announcements"));
const Feedback = lazy(() => import("./pages/Feedback"));
const StaffDashboard = lazy(() => import("./pages/StaffDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const StaffModuleManager = lazy(() => import("./pages/StaffModuleManager"));
const QuizView = lazy(() => import("./pages/QuizView"));
const Help = lazy(() => import("./pages/Help"));
const Certificate = lazy(() => import("./pages/Certificate"));

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        <p className="mt-3 text-sm text-gray-500">Loading page...</p>
      </div>
    </div>
  );
}

function App() {
  return <PageLoader />;
  
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout requiresAuth={false} />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/help" element={<Help />} />
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
          <Route path="/modules/:id/certificate" element={<Certificate />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Protected Routes - Learners Only */}
        <Route
          element={
            <MainLayout requiresAuth={true} allowedRoles={["learner"]} />
          }
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
    </Suspense>
  );
}

export default App;
