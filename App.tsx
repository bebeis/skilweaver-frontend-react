import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { Dashboard } from './pages/Dashboard';
import { ProfileSettings } from './pages/settings/ProfileSettings';
import { Skills } from './pages/skills/Skills';
import { SkillForm } from './pages/skills/SkillForm';
import { Goals } from './pages/goals/Goals';
import { Technologies } from './pages/technologies/Technologies';
import { TechnologyDetail } from './pages/technologies/TechnologyDetail';
import { LearningPlans } from './pages/learning-plans/LearningPlans';
import { LearningPlanNew } from './pages/learning-plans/LearningPlanNew';
import { LearningPlanDetail } from './pages/learning-plans/LearningPlanDetail';
import { TechExplorer } from './pages/explore/TechExplorer';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();

  // Show nothing while initializing (prevents flashing login page)
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="settings/profile" element={<ProfileSettings />} />
            <Route path="skills" element={<Skills />} />
            <Route path="skills/new" element={<SkillForm />} />
            <Route path="skills/:skillId/edit" element={<SkillForm />} />
            <Route path="goals" element={<Goals />} />
            <Route path="technologies" element={<Technologies />} />
            {/* V4: technologyId → name 기반 라우팅 */}
            <Route path="technologies/:name" element={<TechnologyDetail />} />
            <Route path="explore" element={<TechExplorer />} />
            <Route path="learning-plans" element={<LearningPlans />} />
            <Route path="learning-plans/new" element={<LearningPlanNew />} />
            <Route path="learning-plans/:planId" element={<LearningPlanDetail />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
